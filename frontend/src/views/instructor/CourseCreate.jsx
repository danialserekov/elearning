/* eslint-disable react/jsx-key */
import { useState, useEffect, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useNavigate } from "react-router-dom";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { useAuthStore } from "../../store/auth";
import Swal from "sweetalert2";

function CourseCreate() {
  const [course, setCourse] = useState({
    category: 0,
    file: "",
    image: "",
    title: "",
    description: "",
    price: "",
    level: "",
    language: "",
    platform_status: "Review",
    teacher_course_status: "Draft",
    featured: false,
    course_id: "",
    slug: "",
    date: new Date().toISOString(),
  });

  const [category, setCategory] = useState([]);
  const [ckEditorData, setCKEditorData] = useState("");
  const { user } = useAuthStore((state) => ({
    user: state.user,
  })); // Access user data from useAuthStore
  const teacherId = user?.teacher_id;
  console.log("teacherId", teacherId)
  const [variants, setVariants] = useState([
    {
      title: "",
      items: [{ title: "", description: "", file: null, preview: false }],
    },
  ]);

  const axiosInstance = useMemo(() => useAxios(), []);
  const navigate = useNavigate()

  useEffect(() => {
    axiosInstance.get(`course/category/`).then((res) => {
      setCategory(res.data);
    });
  }, [axiosInstance]);

  const handleCourseInputChange = (event) => {
    setCourse({
      ...course,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  const handleCkEditorChange = (event, editor) => {
    const data = editor.getData();
    setCKEditorData(data);
  };

  const handleCourseImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourse({
          ...course,
          image: {
            file: file,
            preview: reader.result,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCourseIntroVideoChange = (event) => {
    setCourse({
      ...course,
      file: event.target.files[0],
    });
  };

  const handleVariantChange = (index, propertyName, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][propertyName] = value;
    setVariants(updatedVariants);
  };

  const handleItemChange = (variantIndex, itemIndex, propertyName, value) => {
    const updatedVariants = [...variants];
    if (propertyName === "file") {
      updatedVariants[variantIndex].items[itemIndex][propertyName] =
        value.target.files[0];
    } else {
      updatedVariants[variantIndex].items[itemIndex][propertyName] = value;
    }
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: "",
        items: [{ title: "", description: "", file: null, preview: false }],
      },
    ]);
  };

  const removeVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  const addItem = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].items.push({
      title: "",
      description: "",
      file: null,
      preview: false,
    });
    setVariants(updatedVariants);
  };

  const removeItem = (variantIndex, itemIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].items.splice(itemIndex, 1);
    setVariants(updatedVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("teacherId", teacherId)
    if (!teacherId) {
      Swal.fire({
        icon: "error",
        title: "Teacher ID is missing!",
        text: "Please ensure you are logged in as an instructor.",
      });
      return;
    }

    const formdata = new FormData();
    formdata.append("title", course.title);
    formdata.append("description", ckEditorData);
    formdata.append("category", course.category);
    formdata.append("price", course.price); // Ensure price is a string
    formdata.append("level", course.level);
    formdata.append("language", course.language);
    formdata.append("platform_status", course.platform_status);
    formdata.append("teacher_course_status", course.teacher_course_status);
    formdata.append("featured", course.featured);
    formdata.append("course_id", course.course_id);
    formdata.append("slug", course.slug);
    formdata.append("date", course.date);
    formdata.append("teacher", parseInt(teacherId));

    if (course.image && course.image.file) {
      formdata.append("image", course.image.file);
    }

    if (course.file) {
      formdata.append("file", course.file);
    }

    const processedVariants = variants.map((variant) => {
      return {
        ...variant,
        items: variant.items.map((item) => {
          const { file, ...rest } = item;
          return rest;
        }),
      };
    });

    formdata.append("variants", JSON.stringify(processedVariants));

    // Append files separately
    variants.forEach((variant, variantIndex) => {
      variant.items.forEach((item, itemIndex) => {
        if (item.file) {
          formdata.append(`file-${variantIndex}-${itemIndex}`, item.file);
        }
      });
    });

    try {
      const response = await axiosInstance.post(
        `teacher/course-create/`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Course Created Successfully",
      }).then(() => {
      navigate("/instructor/courses/");
    });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to create course",
        text: error.response?.data?.detail || "Something went wrong",
      });
    }
  };

  return (
    <>
      <BaseHeader />
      <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />
            <form className="col-lg-9 col-md-8 col-12" onSubmit={handleSubmit}>
              <section className="py-4 py-lg-6 bg-primary rounded-3">
                <div className="container">
                  <div className="row">
                    <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                      <div className="d-lg-flex align-items-center justify-content-between">
                        <div className="mb-4 mb-lg-0">
                          <h1 className="text-white mb-1">Add New Course</h1>
                          <p className="mb-0 text-white lead">
                            Just fill the form and create your courses.
                          </p>
                        </div>
                        <div>
                          <Link
                            to="/instructor/courses/"
                            className="btn"
                            style={{ backgroundColor: "white" }}
                          >
                            <i className="fas fa-arrow-left"></i> Back to Course
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="pb-8 mt-5">
                <div className="card mb-3">
                  <div className="card-header border-bottom px-4 py-3">
                    <h4 className="mb-0">Basic Information</h4>
                  </div>
                  <div className="card-body">
                    <label htmlFor="courseTHumbnail" className="form-label">
                      Thumbnail Preview
                    </label>
                    <img
                      style={{
                        width: "100%",
                        height: "330px",
                        objectFit: "none",
                        borderRadius: "10px",
                      }}
                      className="mb-4"
                      src={
                        course.image.preview ||
                        "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"
                      }
                      alt="Default image"
                    />
                    <div className="mb-3">
                      <label htmlFor="courseTHumbnail" className="form-label">
                        Course Thumbnail
                      </label>
                      <input
                        id="courseTHumbnail"
                        className="form-control"
                        type="file"
                        name="image"
                        onChange={handleCourseImageChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="courseTitle" className="form-label">
                        Intro Video
                      </label>
                      <input
                        id="introvideo"
                        className="form-control"
                        type="file"
                        name="file"
                        onChange={handleCourseIntroVideoChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="courseTitle" className="form-label">
                        Title
                      </label>
                      <input
                        id="courseTitle"
                        className="form-control"
                        type="text"
                        placeholder=""
                        name="title"
                        value={course.title}
                        onChange={handleCourseInputChange}
                      />
                      <small>Write a 60 character course title.</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Courses category</label>
                      <select
                        className="form-select"
                        name="category"
                        value={course.category}
                        onChange={handleCourseInputChange}
                      >
                        <option value="">-------------</option>
                        {category?.map((c, index) => (
                          <option key={index} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                      <small>
                        Help people find your courses by choosing categories
                        that represent your course.
                      </small>
                    </div>
                    <div className="mb-3">
                      <select
                        className="form-select"
                        name="level"
                        value={course.level}
                        onChange={handleCourseInputChange}
                      >
                        <option value="">Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <select
                        className="form-select"
                        name="language"
                        value={course.language}
                        onChange={handleCourseInputChange}
                      >
                        <option value="">Select Language</option>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Course Description</label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={ckEditorData}
                        onChange={handleCkEditorChange}
                        style={{ height: "400px" }}
                        name="description"
                      />
                      <small>A brief summary of your courses.</small>
                    </div>
                    <label htmlFor="courseTitle" className="form-label">
                      Price
                    </label>
                    <input
                      id="courseTitle"
                      className="form-control"
                      type="text"
                      name="price"
                      value={course.price}
                      onChange={handleCourseInputChange}
                      placeholder="$20.99"
                    />
                  </div>
                  <div className="card-header border-bottom px-4 py-3">
                    <h4 className="mb-0">Curriculum</h4>
                  </div>
                  <div className="card-body ">
                    {variants.map((variant, variantIndex) => (
                      <div
                        className="border p-2 rounded-3 mb-3"
                        style={{ backgroundColor: "#ededed" }}
                        key={variantIndex}
                      >
                        <div className="d-flex mb-4">
                          <input
                            type="text"
                            placeholder="Section Name"
                            required
                            className="form-control"
                            value={variant.title}
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                "title",
                                e.target.value
                              )
                            }
                          />
                          <button
                            className="btn btn-danger ms-2"
                            type="button"
                            onClick={() => removeVariant(variantIndex)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        {variant.items.map((item, itemIndex) => (
                          <div
                            className=" mb-2 mt-2 shadow p-2 rounded-3 "
                            style={{ border: "1px #bdbdbd solid" }}
                            key={itemIndex}
                          >
                            <input
                              type="text"
                              placeholder="Lesson Title"
                              className="form-control me-1 mt-2"
                              value={item.title}
                              name="title"
                              onChange={(e) =>
                                handleItemChange(
                                  variantIndex,
                                  itemIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                            <textarea
                              name="description"
                              id=""
                              cols="30"
                              className="form-control mt-2"
                              placeholder="Lesson Description"
                              rows="4"
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(
                                  variantIndex,
                                  itemIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                            ></textarea>
                            <div className="row d-flex align-items-center">
                              <div className="col-lg-8">
                                <input
                                  type="file"
                                  placeholder="Item File"
                                  className="form-control me-1 mt-2"
                                  name="file"
                                  onChange={(e) =>
                                    handleItemChange(
                                      variantIndex,
                                      itemIndex,
                                      "file",
                                      e
                                    )
                                  }
                                />
                              </div>
                              <div className="col-lg-4">
                                <label
                                  htmlFor={`checkbox${variantIndex}${itemIndex}`}
                                >
                                  Preview
                                </label>
                                <input
                                  type="checkbox"
                                  className="form-check-input ms-2"
                                  id={`checkbox${variantIndex}${itemIndex}`}
                                  checked={item.preview}
                                  onChange={(e) =>
                                    handleItemChange(
                                      variantIndex,
                                      itemIndex,
                                      "preview",
                                      e.target.checked
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger me-2 mt-2"
                              type="button"
                              onClick={() =>
                                removeItem(variantIndex, itemIndex)
                              }
                            >
                              Delete Lesson <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          className="btn btn-sm btn-primary mt-2"
                          type="button"
                          onClick={() => addItem(variantIndex)}
                        >
                          + Add Lesson
                        </button>
                      </div>
                    ))}
                    <button
                      className="btn btn-sm btn-secondary w-100 mt-2"
                      type="button"
                      onClick={addVariant}
                    >
                      + New Section
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-lg btn-success w-100 mt-2"
                  type="submit"
                  data-testid="create-course-button"
                >
                  Create Course <i className="fas fa-check-circle"></i>
                </button>
              </section>
            </form>
          </div>
        </div>
      </section>
      <BaseFooter />
    </>
  );
}

export default CourseCreate;