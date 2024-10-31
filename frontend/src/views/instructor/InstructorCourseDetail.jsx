import React, { useEffect, useState } from 'react';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import Sidebar from './Partials/Sidebar';
import Header from './Partials/Header';
import ReactPlayer from 'react-player';
import useAxios from '../../utils/useAxios';
import { useParams } from 'react-router-dom';
import moment from 'moment';

function InstructorCourseDetail() {
    const param = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        useAxios()
            .get(`teacher/course-detail/${param.course_id}/`)
            .then((res) => {
                setCourse(res.data);
            });
    }, [param.course_id]);

    if (!course) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <BaseHeader />

            <section className="pt-5 pb-5" style={{ backgroundColor: '#f5f5f5' }}>
                <div className="container">
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12 text-center">
                            <section className="bg-blue py-7">
                                <div className="container">
                                    <h3>{course.title}</h3>
                                    <p>{course.category.title}</p>
                                    {course.file && (
                                        <ReactPlayer url={course.file} width="100%" height={600} controls />
                                    )}
                                </div>
                            </section>
                            <section className="mt-4">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card shadow rounded-2 p-0 mt-n5">
                                                <div className="card-header border-bottom px-4 pt-3 pb-0">
                                                    <h3>Course Description</h3>
                                                    <p dangerouslySetInnerHTML={{ __html: course.description }}></p>
                                                </div>
                                                <div className="card-body p-sm-4">
                                                    <h4>Curriculum</h4>
                                                    <div className="accordion accordion-icon accordion-border" id="accordionExample2">
                                                        {course.curriculum.map((section, sectionIndex) => (
                                                            <div className="accordion-item mb-3" key={section.id}>
                                                                <h6 className="accordion-header font-base" id={`heading-${sectionIndex}`}>
                                                                    <button
                                                                        className="accordion-button fw-bold rounded d-sm-flex d-inline-block collapsed"
                                                                        type="button"
                                                                        data-bs-toggle="collapse"
                                                                        data-bs-target={`#collapse-${sectionIndex}`}
                                                                        aria-expanded="false"
                                                                        aria-controls={`collapse-${sectionIndex}`}
                                                                    >
                                                                        {section.title}
                                                                        <span className="small ms-0 ms-sm-2">({section.items.length} Lectures)</span>
                                                                    </button>
                                                                </h6>
                                                                <div id={`collapse-${sectionIndex}`} className="accordion-collapse collapse" aria-labelledby={`heading-${sectionIndex}`} data-bs-parent="#accordionExample2">
                                                                    <div className="accordion-body mt-3">
                                                                        {section.items.map((item, itemIndex) => (
                                                                            <div className="mb-2 mt-2 shadow p-2 rounded-3" style={{ border: "1px #bdbdbd solid" }} key={item.id}>
                                                                                <h6>{item.title}</h6>
                                                                                <p>{item.description}</p>
                                                                                {item.file && (
                                                                                    <ReactPlayer url={item.file} width="100%" controls />
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter />
        </>
    );
}

export default InstructorCourseDetail;
