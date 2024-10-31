from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from users.models import Profile, User
from rest_framework import serializers
from api import models


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.name
        token['email'] = user.email
        token['username'] = user.username
        
        '''try:
            token['teacher_id'] = user.teacher.id
        except:
            token['teacher_id'] = 0
        
        '''
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password1 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'password1']

    def validate(self, attr):
        if attr['password'] != attr['password1']:
            raise serializers.ValidationError({"password": "Passwords doesn't match"})
        
        return attr
    
    def create(self, validated_data):
        user = User.objects.create(
            name=validated_data['name'],
            email=validated_data['email'],
        )
        email_username, _ = user.email.split("@")
        user.username = email_username
        user.set_password(validated_data['password'])
        user.save()

        return user
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'title', 'image', 'slug', 'course_count']
        model = models.Category

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["user", "profile_image", "name", "bio", "facebook", "twitter", "linkedin", "about_me", "country", "students", "courses", "review"]
        model = models.Teacher

class VariantItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.VariantItem
    def __init__(self, *args, **kwargs):
        super(VariantItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class VariantSerializer(serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many=True)
    items = VariantItemSerializer(many=True)
    class Meta:
        fields = '__all__'
        model = models.Variant

    def __init__(self, *args, **kwargs):
        super(VariantSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        fields = '__all__'
        model = models.Question_Answer_Message

class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many=True)
    profile = ProfileSerializer(many=False)
    class Meta:
        fields = '__all__'
        model = models.Question_Answer

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Cart

    def __init__(self, *args, **kwargs):
        super(CartSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CartOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.CartOrderItem

    def __init__(self, *args, **kwargs):
        super(CartOrderItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CartOrderSerializer(serializers.ModelSerializer):
    order_items = CartOrderItemSerializer(many=True)
    class Meta:
        fields = '__all__'
        model = models.CartOrder

    def __init__(self, *args, **kwargs):
        super(CartOrderSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Certificate

class CompletedLessonSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.CompletedLesson

    def __init__(self, *args, **kwargs):
        super(CompletedLessonSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Note

class ReviewSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        fields = '__all__'
        model = models.Review

    def __init__(self, *args, **kwargs):
        super(ReviewSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = models.Notification

class CouponSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = models.Coupon

class WishlistSerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = models.Wishlist

    def __init__(self, *args, **kwargs):
        super(WishlistSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CountrySerializer(serializers.ModelSerializer):

    class Meta:
        fields = '__all__'
        model = models.Country

class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many=True, read_only=True)
    completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum = VariantSerializer(many=True, read_only=True)
    note = NoteSerializer(many=True, read_only=True)
    question_answer = Question_AnswerSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)
    profile = serializers.SerializerMethodField()

    class Meta:
        fields = '__all__'
        model = models.EnrolledCourse

    def __init__(self, *args, **kwargs):
        super(EnrolledCourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

    def get_profile(self, obj):
        try:
            return ProfileSerializer(obj.user.profile, context=self.context).data
        except Profile.DoesNotExist:
            # Log the issue or handle it appropriately
            print(f"Profile does not exist for user ID: {obj.user.id}, Email: {obj.user.email}")
            return None  # Or return a default value if required

class CourseSerializer(serializers.ModelSerializer):
    quiz_status = serializers.SerializerMethodField()
    students =  serializers.SerializerMethodField()
    curriculum = VariantSerializer(many=True, required=False, read_only=True,)
    lectures = VariantItemSerializer(many=True, required=False, read_only=True,)
    reviews = ReviewSerializer(many=True, read_only=True, required=False)
    class Meta:
        fields = ["id", "category", "teacher", "file", "image", "title", "description", "price", "language", "level", "platform_status", "teacher_course_status", "featured", "course_id", "slug", "date", "students", "curriculum", "lectures", "average_rating", "rating_count", "reviews", "quiz_status"]
        model = models.Course

    def __init__(self, *args, **kwargs):
        super(CourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

    # def get_students(self, obj):
    #     enrolled_courses = obj.students()
    #     student_data = []

    #     for enrolled in enrolled_courses:
    #         if enrolled.user is None:
    #             # Handle the case where the user is None
    #             print(f"Enrolled course with ID {enrolled.id} has no associated user.")
    #             continue

    #         try:
    #             student_data.append(EnrolledCourseSerializer(enrolled, context=self.context).data)
    #         except Profile.DoesNotExist:
    #             # Handle the case where the profile does not exist
    #             print(f"Profile does not exist for user ID: {enrolled.user.id}, Email: {enrolled.user.email}")
    #             student_data.append({"user": {"id": enrolled.user.id, "email": enrolled.user.email}, "profile": None})

    #     return student_data

    def get_students(self, obj):
        enrolled_courses = obj.students()
        student_data = []

        for enrolled in enrolled_courses:
            if enrolled.user is None:
                # Handle the case where the user is None
                print(f"Enrolled course with ID {enrolled.id} has no associated user.")
                continue

            try:
                profile = enrolled.user.profile
            except Profile.DoesNotExist:
                # Handle the case where the profile does not exist
                print(f"Profile does not exist for user ID: {enrolled.user.id}, Email: {enrolled.user.email}")
                student_data.append({"user": {"id": enrolled.user.id, "email": enrolled.user.email}, "profile": None})
                continue

            # Serialize the enrolled course including the profile data
            student_data.append(EnrolledCourseSerializer(enrolled, context=self.context).data)

        return student_data


    def get_quiz_status(self, obj):
        quiz = obj.quizzes.filter(status='published').first()
        return 'Published' if quiz else 'No Quiz'
    
class StudentSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    completed_lessons = serializers.IntegerField(default=0)
    achieved_certificates = serializers.IntegerField(default=0)

class TeacherSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    total_students = serializers.IntegerField(default=0)
    total_revenue = serializers.IntegerField(default=0)
    monthly_revenue = serializers.IntegerField(default=0)

class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.QuizAnswer
        fields = ['id', 'answer_text', 'is_correct']  # Use 'answer_text' as in the payload

class QuizQuestionSerializer(serializers.ModelSerializer):
    answers = QuizAnswerSerializer(many=True)

    class Meta:
        model = models.QuizQuestion
        fields = ['id', 'question_text', 'score', 'explanation', 'answers']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        question = models.QuizQuestion.objects.create(**validated_data)
        for answer_data in answers_data:
            models.QuizAnswer.objects.create(question=question, **answer_data)
        return question

class QuizSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    questions = QuizQuestionSerializer(many=True)
    class Meta:
        model = models.Quiz
        fields = ['id', 'title', 'description', 'course', 'course_name','questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = models.Quiz.objects.create(**validated_data)
        for question_data in questions_data:
            answers_data = question_data.pop('answers')
            question = models.QuizQuestion.objects.create(quiz=quiz, **question_data)
            for answer_data in answers_data:
                models.QuizAnswer.objects.create(question=question, **answer_data)
        return quiz

    def get_course_name(self, obj):
        return obj.course.title
    
    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', [])
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.course = validated_data.get('course', instance.course)
        instance.save()

        existing_question_ids = [item.id for item in instance.questions.all()]
        new_question_ids = [item['id'] for item in questions_data if 'id' in item]

        # Delete questions that are no longer in the updated data
        for question_id in existing_question_ids:
            if question_id not in new_question_ids:
                models.QuizQuestion.objects.filter(id=question_id).delete()

        for question_data in questions_data:
            answers_data = question_data.pop('answers', [])
            question_id = question_data.get('id')

            if question_id:
                # Update existing question
                question = models.QuizQuestion.objects.get(id=question_id, quiz=instance)
                question.question_text = question_data.get('question_text', question.question_text)
                question.score = question_data.get('score', question.score)
                question.explanation = question_data.get('explanation', question.explanation)
                question.save()

                # Handle updating answers
                existing_answer_ids = [item.id for item in question.answers.all()]
                new_answer_ids = [item['id'] for item in answers_data if 'id' in item]

                # Delete answers that are no longer in the updated data
                for answer_id in existing_answer_ids:
                    if answer_id not in new_answer_ids:
                        models.QuizAnswer.objects.filter(id=answer_id).delete()

                for answer_data in answers_data:
                    answer_id = answer_data.get('id')
                    if answer_id:
                        # Update existing answer
                        answer = models.QuizAnswer.objects.get(id=answer_id, question=question)
                        answer.answer_text = answer_data.get('answer_text', answer.answer_text)
                        answer.is_correct = answer_data.get('is_correct', answer.is_correct)
                        answer.save()
                    else:
                        # Create new answer
                        models.QuizAnswer.objects.create(question=question, **answer_data)
            else:
                # Create new question
                new_question = models.QuizQuestion.objects.create(quiz=instance, **question_data)
                for answer_data in answers_data:
                    models.QuizAnswer.objects.create(question=new_question, **answer_data)

        return instance