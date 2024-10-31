import random
import stripe
import requests
import json
from django.shortcuts import render, redirect
from django.core.mail import EmailMultiAlternatives
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
from django.utils import timezone
from django.utils.safestring import mark_safe
from django.contrib.auth.hashers import check_password
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models.functions import  TruncDay, TruncMonth, TruncYear
from django.db.models import Sum, Count, Avg
from django.db import IntegrityError
from django.template.loader import render_to_string
from decimal import Decimal
from datetime import datetime, timedelta
from distutils.util import strtobool
from collections import defaultdict
from api import serializer
from api import models
from users.models import User, Profile
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken


stripe.api_key = settings.STRIPE_SECRET_KEY
PAYPAL_CLIENT_ID = settings.PAYPAL_CLIENT_ID
PAYPAL_SECRET_ID = settings.PAYPAL_SECRET_ID


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = serializer.RegisterSerializer

def generate_random_otp(length=7):
    otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
    return otp

class PasswordResetEmailVerifyView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = serializer.UserSerializer

    def get_object(self):
        email = self.kwargs['email']

        user = User.objects.filter(email=email).first()

        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()

            link = f"http://localhost:5173/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"

            context = {
                "link": link,
                "username": user.username
            }

            subject = "Password Rest Email"
            text_body = render_to_string("email/password-reset.txt", context)
            html_body = render_to_string("email/password-reset.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[user.email],
                body=text_body
            )

            msg.attach_alternative(html_body, "text/html")
            msg.send()

            print("link ======", link)

        return user
    
class PasswordChangeView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data['otp']
        uuidb64 = request.data['uuidb64']
        password = request.data['password']

        user = User.objects.get(id=uuidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp = ""
            user.save()

            return Response({"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "User Does Not Exists"}, status=status.HTTP_404_NOT_FOUND)
        
class ChangePasswordView(generics.CreateAPIView):
    serializer_class = serializer.UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        old_password = request.data['old_password']
        new_password = request.data['new_password']

        user = User.objects.get(id=user_id)
        if user is not None:
            if check_password(old_password, user.password):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password changed successfully", "icon": "success"})
            else:
                return Response({"message": "Old password is incorrect", "icon": "warning"})
        else:
            return Response({"message": "User does not exists", "icon": "error"})

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Profile.objects.get(user=user)

class CategoryListView(generics.ListAPIView):
    queryset = models.Category.objects.filter(active=True)  
    serializer_class = serializer.CategorySerializer
    permission_classes = [AllowAny]

class CourseListView(generics.ListAPIView):
    queryset = models.Course.objects.filter(platform_status="Published", 
                                            teacher_course_status="Published")
    serializer_class = serializer.CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = models.Course.objects.filter(platform_status="Published", teacher_course_status="Published")
    lookup_field = 'slug'

    def get_object(self):
        slug = self.kwargs['slug']
        print(f"Fetching course with slug: {slug}")
        try:
            course = models.Course.objects.get(slug=slug, platform_status="Published", teacher_course_status="Published")
            print(f"Course found: {course.title}")
            return course
        except models.Course.DoesNotExist:
            print("Course not found")
            return None

class CartView(generics.CreateAPIView):
    queryset = models.Cart.objects.all()
    serializer_class = serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']  
        user_id = request.data['user_id']
        price = request.data['price']
        country_name = request.data['country_name']
        cart_id = request.data['cart_id']

        print("course_id ==========", course_id)

        course = models.Course.objects.filter(id=course_id).first()
        
        if user_id != "undefined":
            user = User.objects.filter(id=user_id).first()
        else:
            user = None

        try:
            country_object = models.Country.objects.filter(name=country_name).first()
            country = country_object.name
        except:
            country_object = None
            country = "United States"

        if country_object:
            tax_rate = country_object.tax_rate / 100
        else:
            tax_rate = 0

        cart = models.Cart.objects.filter(cart_id=cart_id, course=course).first()

        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Updated Successfully"}, status=status.HTTP_200_OK)

        else:
            cart = models.Cart()

            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart Created Successfully"}, status=status.HTTP_201_CREATED)

class CartListView(generics.ListAPIView):
    serializer_class = serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = models.Cart.objects.filter(cart_id=cart_id)
        return queryset
    
class CartItemDeleteView(generics.DestroyAPIView):
    serializer_class = serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']

        return models.Cart.objects.filter(cart_id=cart_id, id=item_id).first()

class CartStatsView(generics.RetrieveAPIView):
    serializer_class = serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = models.Cart.objects.filter(cart_id=cart_id)
        return queryset
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        total_price = 0.00
        total_tax = 0.00
        total_total = 0.00

        for cart_item in queryset:
            total_price += float(self.calculate_price(cart_item))
            total_tax += float(self.calculate_tax(cart_item))
            total_total += round(float(self.calculate_total(cart_item)), 2)

        data = {
            "price": total_price,
            "tax": total_tax,
            "total": total_total,
        }

        return Response(data)

    def calculate_price(self, cart_item):
        return cart_item.price
    
    def calculate_tax(self, cart_item):
        return cart_item.tax_fee

    def calculate_total(self, cart_item):
        return cart_item.total

class CreateOrderView(generics.CreateAPIView):
    serializer_class = serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        name = request.data['name']
        email = request.data['email']
        country = request.data['country']
        cart_id = request.data['cart_id']
        user_id = request.data['user_id']

        if user_id != 0:
            user = User.objects.get(id=user_id)
        else:
            user = None

        cart_items = models.Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal(0.00)
        total_tax = Decimal(0.00)
        total_initial_total = Decimal(0.00)
        total_total = Decimal(0.00)

        order = models.CartOrder.objects.create(
            name=name,
            email=email,
            country=country,
            student=user
        )

        for c in cart_items:
            models.CartOrderItem.objects.create(
                order=order,
                course=c.course,
                price=c.price,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher
            )

            total_price += Decimal(c.price)
            total_tax += Decimal(c.tax_fee)
            total_initial_total += Decimal(c.total)
            total_total += Decimal(c.total)

            order.teachers.add(c.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        return Response({"message": "Order Created Successfully", "order_oid": order.oid}, status=status.HTTP_201_CREATED)

class CheckoutView(generics.RetrieveAPIView):
    serializer_class = serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = models.CartOrder.objects.all()
    lookup_field = 'oid'

class CouponApplyView(generics.CreateAPIView):
    serializer_class = serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_oid = request.data['order_oid']
        coupon_code = request.data['coupon_code']

        order = models.CartOrder.objects.get(oid=order_oid)
        coupon = models.Coupon.objects.get(code=coupon_code)

        if coupon:
            order_items = models.CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)
            for i in order_items:
                if not coupon in i.coupons.all():
                    discount = i.total * coupon.discount / 100

                    i.total -= discount
                    i.price -= discount
                    i.saved += discount
                    i.applied_coupon = True
                    i.coupons.add(coupon)

                    order.coupons.add(coupon)
                    order.total -= discount
                    order.sub_total -= discount
                    order.saved += discount

                    i.save()
                    order.save()
                    coupon.used_by.add(order.student)
                    return Response({"message": "Coupon Found and Activated", "icon": "success"}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"message": "Coupon Already Applied", "icon": "warning"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Coupon Not Found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)

class StripeCheckoutView(generics.CreateAPIView):
    serializer_class = serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        
        order_oid = self.kwargs['order_oid']
        order = models.CartOrder.objects.get(oid=order_oid)

        if not order:
            return Response({"message": "Order Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email = order.email,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': order.name,
                            },
                            'unit_amount': int(order.total * 100)
                        },
                        'quantity': 1
                    }
                ],
                mode='payment',
                success_url=settings.FRONTEND_SITE_URL + '/payment-success/' + order.oid + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url= settings.FRONTEND_SITE_URL + '/payment-failed/'
            )
            print("checkout_session ====", checkout_session)
            order.stripe_session_id = checkout_session.id

            return redirect(checkout_session.url)
        except stripe.error.StripeError as e:
            return Response({"message": f"Something went wrong when trying to make payment. Error: {str(e)}"})

def get_access_token(client_id, secret_key):
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    data = {'grant_type': 'client_credentials'}
    auth = (client_id, secret_key)
    response = requests.post(token_url, data=data, auth=auth)

    if response.status_code == 200:
        print("Access TOken ====", response.json()['access_token'])
        return response.json()['access_token']
    else:
        raise Exception(f"Failed to get access token from paypal {response.status_code}")
    
class PaymentSuccessView(generics.CreateAPIView):
    serializer_class = serializer.CartOrderSerializer
    queryset = models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        order_oid = request.data['order_oid']
        session_id = request.data['session_id']
        paypal_order_id = request.data['paypal_order_id']

        order = models.CartOrder.objects.get(oid=order_oid)
        order_items = models.CartOrderItem.objects.filter(order=order)


        # Paypal payment success
        if paypal_order_id != "null":
            paypal_api_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {get_access_token(PAYPAL_CLIENT_ID, PAYPAL_SECRET_ID)}"
            }
            response = requests.get(paypal_api_url, headers=headers)
            if response.status_code == 200:
                paypal_order_data = response.json()
                paypal_payment_status = paypal_order_data['status']
                if paypal_payment_status == "COMPLETED":
                    if order.payment_status == "Processing":
                        order.payment_status = "Paid"
                        order.save()
                       # api_models.CartOrderItem.objects.filter(order=order).delete()
                        models.Notification.objects.create(user=order.student, order=order, type="Course Enrollment Completed")

                        for o in order_items:
                            models.Notification.objects.create(
                                teacher=o.teacher,
                                order=order,
                                order_item=o,
                                type="New Order",
                            )
                            models.EnrolledCourse.objects.create(
                                course=o.course,
                                user=order.student,
                                teacher=o.teacher,
                                order_item=o
                            )

                        return Response({"message": "Payment Successfull"})
                    else:
                        return Response({"message": "Already Paid"})
                else:
                    return Response({"message": "Payment Failed"})
            else:
                return Response({"message": "PayPal Error Occured"})


        # Stripe payment success
        if session_id != 'null':
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid":
                if order.payment_status == "Processing":
                    order.payment_status = "Paid"
                    order.save()
                   # api_models.CartOrderItem.objects.filter(order=order).delete()
                    models.Notification.objects.create(user=order.student, order=order, type="Course Enrollment Completed")
                    for o in order_items:
                        models.Notification.objects.create(
                            teacher=o.teacher,
                            order=order,
                            order_item=o,
                            type="New Order",
                        )
                        models.EnrolledCourse.objects.create(
                            course=o.course,
                            user=order.student,
                            teacher=o.teacher,
                            order_item=o
                        )
                    return Response({"message": "Payment Successfull"})
                else:
                    return Response({"message": "Already Paid"})
            else:
                    return Response({"message": "Payment Failed"})
            
class SearchCourseView(generics.ListAPIView):
    serializer_class = serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        # learn lms
        return models.Course.objects.filter(title__icontains=query, platform_status="Published", teacher_course_status="Published")
    
class StudentSummaryView(generics.ListAPIView):
    serializer_class = serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        total_courses = models.EnrolledCourse.objects.filter(user=user).values('course').distinct().count()
        completed_lessons = models.CompletedLesson.objects.filter(user=user).count()
        achieved_certificates = models.Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class StudentCourseListView(generics.ListAPIView):
    serializer_class = serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        enrolled_courses = models.EnrolledCourse.objects.filter(user=user)

        # Remove duplicates based on course ID
        unique_courses = {}
        for enrollment in enrolled_courses:
            if enrollment.course.id not in unique_courses:
                unique_courses[enrollment.course.id] = enrollment

        return unique_courses.values()
    
class StudentCourseDetailView(generics.RetrieveAPIView):
    serializer_class = serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        return models.EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)
           
class StudentCourseCompletedCreateView(generics.CreateAPIView):
    serializer_class = serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']

        user = User.objects.get(id=user_id)
        course = models.Course.objects.get(id=course_id)
        variant_item = models.VariantItem.objects.get(variant_item_id=variant_item_id)

        completed_lessons = models.CompletedLesson.objects.filter(user=user, course=course, variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message": "Course marked as not completed"})

        else:
            models.CompletedLesson.objects.create(user=user, course=course, variant_item=variant_item)
            return Response({"message": "Course marked as completed"})
        
class StudentNoteCreateView(generics.ListCreateAPIView):
    serializer_class = serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        enrolled = models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        
        return models.Note.objects.filter(user=user, course=enrolled.course)

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        enrollment_id = request.data['enrollment_id']
        title = request.data['title']
        note = request.data['note']

        user = User.objects.get(id=user_id)
        enrolled = models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        
        models.Note.objects.create(user=user, course=enrolled.course, note=note, title=title)

        return Response({"message": "Note created successfullly"}, status=status.HTTP_201_CREATED)
    
class StudentNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        user = User.objects.get(id=user_id)
        enrolled = models.EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        note = models.Note.objects.get(user=user, course=enrolled.course, id=note_id)
        return note

class StudentRateCourseCreateView(generics.CreateAPIView):
    serializer_class = serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        rating = request.data['rating']
        review = request.data['review']

        user = User.objects.get(id=user_id)
        course = models.Course.objects.get(id=course_id)

        models.Review.objects.create(
            user=user,
            course=course,
            review=review,
            rating=rating,
            active=True,
        )

        return Response({"message": "Review created successfullly"}, status=status.HTTP_201_CREATED)

class StudentRateCourseUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = User.objects.get(id=user_id)
        return models.Review.objects.get(id=review_id, user=user)
    
class StudentWishListListCreateView(generics.ListCreateAPIView):
    serializer_class = serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return models.Wishlist.objects.filter(user=user)
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = User.objects.get(id=user_id)
        course = models.Course.objects.get(id=course_id)

        wishlist = models.Wishlist.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
        else:
            models.Wishlist.objects.create(
                user=user, course=course
            )
            return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)

class QuestionAnswerListCreateView(generics.ListCreateAPIView):
    serializer_class = serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = models.Course.objects.get(id=course_id)
        return models.Question_Answer.objects.filter(course=course)
    
    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        title = request.data['title']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = models.Course.objects.get(id=course_id)
        
        question = models.Question_Answer.objects.create(
            course=course,
            user=user,
            title=title
        )

        models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )
        
        return Response({"message": "conversation Started"}, status=status.HTTP_201_CREATED)

class QuestionAnswerMessageSendView(generics.CreateAPIView):
    serializer_class = serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        qa_id = request.data['qa_id']
        user_id = request.data['user_id']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = models.Course.objects.get(id=course_id)
        question = models.Question_Answer.objects.get(qa_id=qa_id)
        models.Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        question_serializer = serializer.Question_AnswerSerializer(question)
        return Response({"messgae": "Message Sent", "question": question_serializer.data})

class TeacherSummaryView(generics.ListAPIView):
    serializer_class = serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        print("teacher_id---", teacher_id)
        teacher = models.Teacher.objects.get(id=teacher_id)

        # Current time
        now = timezone.now()
        # First day of the current month
        first_day_of_month = now.replace(day=1)

        # Calculate total courses
        total_courses = models.Course.objects.filter(teacher=teacher).count()

        # Calculate total revenue (all-time)
        total_revenue = models.CartOrderItem.objects.filter(
            teacher=teacher, 
            order__payment_status="Paid"
        ).aggregate(total_revenue=models.Sum("price"))['total_revenue'] or 0

        # Calculate revenue for the current month
        monthly_revenue = models.CartOrderItem.objects.filter(
            teacher=teacher,
            order__payment_status="Paid",
            date__gte=first_day_of_month  # Only orders from the start of this month
        ).aggregate(total_revenue=models.Sum("price"))['total_revenue'] or 0

        # Find total students
        enrolled_courses = models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "name": user.profile.name,
                    "profile_image": user.profile.profile_image.url,
                    "country": user.profile.country,
                    "date": course.date
                }
                students.append(student)
                unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(students),
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TeacherCourseListView(generics.ListAPIView):
    serializer_class = serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Course.objects.filter(teacher=teacher)
    
class TeacherReviewListView(generics.ListAPIView):
    serializer_class = serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Review.objects.filter(course__teacher=teacher)
    
class TeacherReviewDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Review.objects.get(course__teacher=teacher, id=review_id)
    
class TeacherStudentsListVIew(viewsets.ViewSet):
    
    def list(self, request, teacher_id=None):
        teacher = models.Teacher.objects.get(id=teacher_id)

        enrolled_courses = models.EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "name": user.profile.name,
                    "profile_image": user.profile.profile_image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)
    
@api_view(("GET", ))
def TeacherAllMonthEarningView(request, teacher_id):
    teacher = models.Teacher.objects.get(id=teacher_id)
    
    # Get the interval from query parameters (default to month)
    interval = request.GET.get('interval', 'month')

    # Determine the truncation function based on the interval
    if interval == 'day':
        trunc_func = TruncDay
    elif interval == 'year':
        trunc_func = TruncYear
    else:
        trunc_func = TruncMonth

    # Filter orders by teacher and aggregate earnings
    monthly_earning_tracker = (
        models.CartOrderItem.objects
        .filter(teacher=teacher, order__payment_status="Paid")
        .annotate(
            period=trunc_func("date")
        )
        .values("period")
        .annotate(
            total_earning=Sum("price")
        )
        .order_by("period")
    )

    # Prepare the response data
    data = {
        'intervals': [entry['period'].strftime('%Y-%m-%d') if interval == 'day' else entry['period'].strftime('%Y-%m') for entry in monthly_earning_tracker],
        'earnings': [entry['total_earning'] for entry in monthly_earning_tracker]
    }

    return Response(data)

class TeacherBestSellingCourseView(viewsets.ViewSet):

    def list(self, request, teacher_id=None):
        teacher = models.Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = models.Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(total_price=models.Sum('order_item__price'))['total_price'] or 0
            sales = course.enrolledcourse_set.count()

            courses_with_total_price.append({
                'course_image': course.image.url,
                'course_title': course.title,
                'revenue': revenue,
                'sales': sales,
            })

        return Response(courses_with_total_price)
    
class TeacherCourseOrdersListView(generics.ListAPIView):
    serializer_class = serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = models.Teacher.objects.get(id=teacher_id)

        return models.CartOrderItem.objects.filter(teacher=teacher)

class TeacherQuestionAnswerListView(generics.ListAPIView):
    serializer_class = serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Question_Answer.objects.filter(course__teacher=teacher)
    
class TeacherCouponListCreateView(generics.ListCreateAPIView):
    serializer_class = serializer.CouponSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Coupon.objects.filter(teacher=teacher)
    
class TeacherCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializer.CouponSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Coupon.objects.get(teacher=teacher, id=coupon_id)
    
class TeacherNotificationListView(generics.ListAPIView):
    serializer_class = serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Notification.objects.filter(teacher=teacher, seen=False)
    
class TeacherNotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = models.Teacher.objects.get(id=teacher_id)
        return models.Notification.objects.get(teacher=teacher, id=noti_id)
    
class CourseCreateView(generics.CreateAPIView):
    queryset = models.Course.objects.all()
    serializer_class = serializer.CourseSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        try:
            serializer.is_valid(raise_exception=True)
            course_instance = serializer.save()
        except IntegrityError as e:
            if 'UNIQUE constraint failed: api_course.slug' in str(e):
                return Response({"error": "A course with this slug already exists. Please try again."}, status=status.HTTP_400_BAD_REQUEST)
            raise e
        
        variants_json = self.request.data.get('variants', '[]')
        try:
            variants = json.loads(variants_json)
            for variant in variants:
                variant_instance = models.Variant.objects.create(
                    title=variant['title'],
                    course=course_instance
                )
                for item in variant['items']:
                    file_field_name = f"file-{variants.index(variant)}-{variant['items'].index(item)}"
                    file = self.request.FILES.get(file_field_name)
                    models.VariantItem.objects.create(
                        variant=variant_instance,
                        title=item['title'],
                        description=item['description'],
                        file=file,
                        preview=item['preview']
                    )
        except json.JSONDecodeError as e:
            return Response({"error": "Invalid JSON for variants"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseUpdateView(generics.RetrieveUpdateAPIView):
    querysect = models.Course.objects.all()
    serializer_class = serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = models.Teacher.objects.get(id=teacher_id)
        course = models.Course.objects.get(course_id=course_id)

        return course
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None
        
        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data['category'] != "undefined":
            category = api_models.Category.objects.get(id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = models.VariantItem.objects.filter(variant_item_id=item_data.get("variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None
                            
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )
                        
                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = models.VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )
                        
                        variant_item.save()

                else:
                    new_variant = models.Variant.objects.create(
                        course=course, title=title
                    )

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        models.VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 

class CourseDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        course_id = self.kwargs['course_id']
        return models.Course.objects.get(course_id=course_id)

class CourseVariantDeleteView(generics.DestroyAPIView):
    serializer_class = serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        print("variant_id ========", variant_id)

        teacher = models.Teacher.objects.get(id=teacher_id)
        course = models.Course.objects.get(teacher=teacher, course_id=course_id)
        return models.Variant.objects.get(id=variant_id)
    
class CourseVariantItemDeleteVIew(generics.DestroyAPIView):
    serializer_class = serializer.VariantItemSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']


        teacher = models.Teacher.objects.get(id=teacher_id)
        course = models.Course.objects.get(teacher=teacher, course_id=course_id)
        variant = models.Variant.objects.get(variant_id=variant_id, course=course)
        return models.VariantItem.objects.get(variant=variant, variant_item_id=variant_item_id)
    
@api_view(['GET'])
def enrollment_trends(request, teacher_id):
    # Get the interval from query parameters (default to month)
    interval = request.GET.get('interval', 'month')

    # Determine the truncation function based on the interval
    if interval == 'day':
        trunc_func = TruncDay
    elif interval == 'year':
        trunc_func = TruncYear
    else:
        trunc_func = TruncMonth

    # Filter enrollments for the teacher's courses
    enrollments = models.EnrolledCourse.objects.filter(teacher__id=teacher_id)
    
    # Aggregate enrollments by the selected interval
    enrollments_by_interval = enrollments.annotate(interval=trunc_func('date')).values('interval').annotate(count=Count('id')).order_by('interval')

    data = {
        'intervals': [entry['interval'].strftime('%Y-%m-%d') if interval == 'day' else entry['interval'].strftime('%Y-%m') for entry in enrollments_by_interval],
        'counts': [entry['count'] for entry in enrollments_by_interval]
    }

    return Response(data)

@api_view(['GET'])
def revenue_distribution(request, teacher_id):
    # Aggregate total revenue per course for a specific teacher
    revenue_data = (
        models.CartOrderItem.objects
        .filter(teacher_id=teacher_id, order__payment_status="Paid")
        .values('course__title')
        .annotate(total_revenue=Sum('price'))
        .order_by('-total_revenue')
    )

    # Prepare data for the frontend
    data = {
        'courses': [entry['course__title'] for entry in revenue_data],
        'revenues': [entry['total_revenue'] for entry in revenue_data],
    }

    return Response(data)

@api_view(['GET'])
def course_popularity_vs_revenue(request, teacher_id):
    # Get all courses by the teacher
    courses = models.Course.objects.filter(teacher_id=teacher_id)
    
    # Prepare data for each course
    data = []
    for course in courses:
        enrollments = models.EnrolledCourse.objects.filter(course=course).count()
        total_revenue = models.CartOrderItem.objects.filter(course=course, order__payment_status="Paid").aggregate(total=Sum('price'))['total'] or 0
        
        # Calculate the total number of completed lessons for the course
        total_completed_lessons = models.CompletedLesson.objects.filter(course=course).count()
        
        # Assuming the total number of lessons in the course is equal to the number of variant items
        total_lessons = models.VariantItem.objects.filter(variant__course=course).count()

        # Calculate completion rate
        completion_rate = (total_completed_lessons / (total_lessons * enrollments)) * 100 if total_lessons > 0 and enrollments > 0 else 0
        
        data.append({
            'course_title': course.title,
            'enrollments': enrollments,
            'revenue': total_revenue,
            'completion_rate': completion_rate,  # This will be the bubble size
        })
    
    return Response(data)

@api_view(['GET'])
def student_course_progress(request, user_id):
    enrolled_courses = models.EnrolledCourse.objects.filter(user_id=user_id)
    
    course_progress = []

    for enrollment in enrolled_courses:
        total_lessons = models.VariantItem.objects.filter(variant__course=enrollment.course).count()
        completed_lessons = models.CompletedLesson.objects.filter(course=enrollment.course, user_id=user_id).count()

        if total_lessons > 0:
            progress_percentage = round((completed_lessons / total_lessons) * 100, 2)
        else:
            progress_percentage = 0
        
        course_progress.append({
            'course_title': enrollment.course.title,
            'progress': progress_percentage
        })

    return Response({'course_progress': course_progress})

# View for creating a new quiz
class QuizCreateView(generics.CreateAPIView):
    queryset = models.Quiz.objects.all()
    serializer_class = serializer.QuizSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        course_name = self.request.data.get('course_name', '')
        quiz = serializer.save()

        # Save the course name if needed, or use it however required
        quiz.course_name = course_name
        quiz.save()

class QuizListView(generics.ListAPIView):
    serializer_class = serializer.QuizSerializer

    def get_queryset(self):
        teacher_id = self.request.query_params.get('teacher_id')
        return models.Quiz.objects.filter(course__teacher_id=teacher_id)

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Quiz.objects.all()
    serializer_class = serializer.QuizSerializer

class QuizEditView(generics.RetrieveUpdateAPIView):
    queryset = models.Quiz.objects.all()
    serializer_class = serializer.QuizSerializer
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        questions_data = self.request.data.get('questions', [])
        is_draft = self.request.data.get('is_draft', True)
        
        quiz = serializer.save(status='draft' if is_draft else 'published')

        models.QuizQuestion.objects.filter(quiz=quiz).delete()

        for question_data in questions_data:
            answers_data = question_data.pop('answers', [])
            question = models.QuizQuestion.objects.create(quiz=quiz, **question_data)

            for answer_data in answers_data:
                models.QuizAnswer.objects.create(question=question, **answer_data)

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Quiz.objects.all()
    serializer_class = serializer.QuizSerializer

    def post(self, request, *args, **kwargs):
        instance = self.get_object()  # Retrieve the quiz instance using the primary key from URL
        instance.status = 'published'  # Update the status to 'published'
        instance.save()  # Save the changes to the database
        return Response({'message': 'Quiz published successfully'}, status=status.HTTP_200_OK)
    
class StudentQuizListView(generics.ListAPIView):
    serializer_class = serializer.QuizSerializer

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return models.Quiz.objects.filter(course_id=course_id, status='published')

class SubmitQuizView(APIView):
    def post(self, request, student_id, *args, **kwargs):
        try:
            student = models.User.objects.get(id=student_id)
        except models.User.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        quiz_id = request.data.get('quiz_id')
        answers = request.data.get('answers', [])

        if not quiz_id or not answers:
            return Response({"detail": "Quiz ID and answers are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quiz = models.Quiz.objects.get(id=quiz_id)

            total_score = 0
            student_score = 0

            for answer in answers:
                question_id = answer.get('question_id')
                answer_id = answer.get('answer_id')

                if not question_id or not answer_id:
                    continue

                try:
                    question = models.QuizQuestion.objects.get(id=question_id, quiz=quiz)
                    selected_answer = models.QuizAnswer.objects.get(id=answer_id, question=question)
                    total_score += question.score

                    if selected_answer.is_correct:
                        student_score += question.score

                except (models.QuizQuestion.DoesNotExist, models.QuizAnswer.DoesNotExist):
                    continue

            quiz_attempt = models.QuizAttempt.objects.create(
                user=student,
                quiz=quiz,
                score=student_score,
                total_score=total_score
            )

            return Response({
                "score": quiz_attempt.score,
                "total_score": quiz_attempt.total_score,
                "course_name": quiz.course.title
            }, status=status.HTTP_201_CREATED)

        except models.Quiz.DoesNotExist:
            return Response({"detail": "Quiz not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class StudentQuizDetailView(generics.RetrieveAPIView):
    queryset = models.Quiz.objects.all()
    serializer_class = serializer.QuizSerializer

    def get_object(self):
        quiz_id = self.kwargs.get("quiz_id")
        return self.queryset.filter(id=quiz_id).first()

class StudentQuizScoresView(generics.ListAPIView):
    permission_classes = [AllowAny] 

    def get(self, request, user_id, *args, **kwargs):
       
        try:
            student = models.User.objects.get(id=user_id)
        except models.User.DoesNotExist:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        quiz_attempts = models.QuizAttempt.objects.filter(user=student)
        highest_scores = defaultdict(lambda: {"score": 0, "total_score": 0})

        for attempt in quiz_attempts:
            course_name = attempt.quiz.course.title
            percentage_score = round((attempt.score / attempt.total_score) * 100, 2)

            if percentage_score > highest_scores[course_name]["score"]:
                highest_scores[course_name] = {
                    "course_name": course_name,
                    "quiz_title": attempt.quiz.title,
                    "percentage_score": percentage_score,
                    "score": attempt.score,
                    "total_score": attempt.total_score,
                    "score_label": f"{int(attempt.score)}/{int(attempt.total_score)}", 
                }

        return Response({"quiz_scores": list(highest_scores.values())}, status=status.HTTP_200_OK)
    
class CreateOrderView(generics.CreateAPIView):
    serializer_class = serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = models.CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        # Existing logic for order creation
        name = request.data['name']
        email = request.data['email']
        country = request.data['country']
        cart_id = request.data['cart_id']
        user_id = request.data['user_id']

        if user_id != 0:
            user = User.objects.get(id=user_id)
        else:
            user = None

        cart_items = models.Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal(0.00)
        total_tax = Decimal(0.00)
        total_initial_total = Decimal(0.00)
        total_total = Decimal(0.00)

        order = models.CartOrder.objects.create(
            name=name,
            email=email,
            country=country,
            student=user
        )

        for c in cart_items:
            order_item = models.CartOrderItem.objects.create(
                order=order,
                course=c.course,
                price=c.price,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher
            )

            total_price += Decimal(c.price)
            total_tax += Decimal(c.tax_fee)
            total_initial_total += Decimal(c.total)
            total_total += Decimal(c.total)

            order.teachers.add(c.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = total_total
        order.save()

        # Send enrollment confirmation email to the student
        self.send_enrollment_email(user, order)
        
        # Send enrollment notification email to the teachers
        self.send_enrollment_email_to_teacher(order)

        return Response({"message": "Order Created Successfully", "order_oid": order.oid}, status=status.HTTP_201_CREATED)

    def send_enrollment_email(self, user, order):
        course_names = ", ".join([item.course.title for item in order.orderitem.all()])

        context = {
            "username": user.username if user else order.name,
            "course_name": course_names
        }

        subject = "Course Enrollment Confirmation"
        text_body = render_to_string("email/course_enrollment.txt", context)
        html_body = render_to_string("email/course_enrollment.html", context)

        msg = EmailMultiAlternatives(
            subject=subject,
            from_email=settings.FROM_EMAIL,
            to=[order.email],
            body=text_body
        )

        msg.attach_alternative(html_body, "text/html")
        msg.send()

    def send_enrollment_email_to_teacher(self, order):
        for item in order.orderitem.all():
            teacher = item.teacher
            # Assuming Teacher model has a ForeignKey or OneToOneField to the User model
            teacher_email = teacher.user.email  # or teacher.email if directly available

            context = {
                "teacher_name": teacher.name,
                "student_name": order.name,
                "course_name": item.course.title
            }

            subject = "New Course Enrollment Notification"
            text_body = render_to_string("email/course_enrollment_teacher.txt", context)
            html_body = render_to_string("email/course_enrollment_teacher.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.FROM_EMAIL,
                to=[teacher_email],
                body=text_body
            )

            msg.attach_alternative(html_body, "text/html")
            msg.send()


@staff_member_required
def admin_dashboard(request):
    # Data for Enrollment Chart
    courses = models.Course.objects.all()
    course_titles = [course.title for course in courses]
    student_counts = [models.EnrolledCourse.objects.filter(course=course).count() for course in courses]

    # Data for Completion Rate Line Chart
    completion_rates = []
    for course in courses:
        total_lessons = course.lectures().count()  # Total number of lessons in the course
        total_students = models.EnrolledCourse.objects.filter(course=course).count()  # Total number of students enrolled in the course
        total_completed_lessons = sum([student.completed_lesson().count() for student in models.EnrolledCourse.objects.filter(course=course)])  # Total number of lessons completed by all students

        # Calculate the completion rate as a percentage
        if total_students > 0 and total_lessons > 0:
            rate = (total_completed_lessons / (total_lessons * total_students)) * 100
        else:
            rate = 0
        completion_rates.append(round(rate, 2))

    # Data for Revenue Distribution Pie Chart
    revenue_data = []
    for course in courses:
        total_revenue = models.CartOrderItem.objects.filter(course=course).aggregate(total=models.Sum('price'))['total'] or 0
        revenue_data.append(round(float(total_revenue), 2))  # Convert Decimal to float with 2 decimal places

    context = {
        'course_titles': mark_safe(json.dumps(course_titles)),
        'student_counts': mark_safe(json.dumps(student_counts)),
        'completion_rates': mark_safe(json.dumps(completion_rates)),
        'revenue_data': mark_safe(json.dumps(revenue_data)),
    }
    return render(request, 'admin/dashboard.html', context)
