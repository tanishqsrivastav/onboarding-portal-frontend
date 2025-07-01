import React, { useEffect, useState } from "react";
import axiosInstance from './axiosInstance';

import { useParams, useNavigate } from "react-router-dom";

function Onboarding() {
  const [employeeData, setEmployeeData] = useState([]);
  const [joiningDetails, setJoiningDetails] = useState([]);
  const [agendaData, setAgendaData] = useState([]);
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const fetchOnboardingData = async (id) => {
    try {
      const [employeeRes, joiningRes, agendaRes] = await Promise.all([
        axiosInstance.get(`https://localhost:7264/Onboarding/employee/${id}`),
        axiosInstance.get(`https://localhost:7264/Onboarding/joining-details/${id}`),
        axiosInstance.get(`https://localhost:7264/Onboarding/first-day-agenda/${id}`)
      ]);

      setEmployeeData([employeeRes.data]);
      setJoiningDetails([joiningRes.data]);
      setAgendaData(agendaRes.data);
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchOnboardingData(employeeId);
    } else {
      console.warn("No employeeId in URL. Redirecting to login...");
      navigate("/login");
    }
  }, [employeeId, navigate]);

  

  return (
    <div className="container">
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img
          src="https://i.ibb.co/JRsBtHX8/Vision-Group-1.png"
          alt="Vision Group Logo"
          className="logo"
          style={{ maxHeight: "60px" }}
        />
        
      </div>

      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome To Vision</h1>
          <p>
            We're delighted to welcome you to Vision Group! We're excited to
            have you on board and can't wait to see the incredible contributions
            you'll bring to our team.
          </p>
        </div>
        <div className="office-image-container">
          <img
            src="https://i.ibb.co/MxvzqZBL/vision-image.png"
            alt="Vision Group Office"
            className="office-image"
          />
        </div>
      </div>

      <div className="colored-div">
        <h2 className="section-title">Onboarding Details</h2>
        <p className="onboarding-text">
          As you begin this new journey, your onboarding experience is our top
          priority. We want to ensure you feel supported, informed, and engaged
          from day one.
        </p>

        <h3 className="section-title">Your Start Date & Office Details:</h3>
        <div className="details-grid">
          {employeeData.length > 0 ? (
            employeeData.map((employee, index) => (
              <div key={index} className="detail-item">
                <strong>Employee Name:</strong> {employee.employeeName || "N/A"}
              </div>
            ))
          ) : (
            <p>Loading Employee Data...</p>
          )}

          {joiningDetails.length > 0 ? (
            joiningDetails.map((joining, index) => (
              <React.Fragment key={index}>
                <div className="detail-item">
                  <strong>Start Date:</strong>{" "}
                  {new Date(joining.employeeStartDate).toISOString().split("T")[0]}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong>{" "}
                  {new Date(joining.joiningTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })}
                </div>
                <div className="detail-item">
                  <strong>Location:</strong> {joining.location || "N/A"}
                </div>
                <div className="detail-item">
                  <strong>Point of Contact:</strong> {joining.pointOfContact || "N/A"}
                </div>
              </React.Fragment>
            ))
          ) : (
            <p>Loading Joining Details...</p>
          )}
        </div>
      </div>

      <div className="next-steps">
        <h2>Your First Day Agenda</h2>
        {agendaData.map((item, index) => (
          <AgendaItem
            key={index}
            imgSrc={item.agendaImage}
            time={item.time}
            title={item.title}
            description={item.subTitle}
          />
        ))}
      </div>

      <div className="next-steps">
        <h2>Next Steps</h2>
        <p>
          As your first day wraps up, we'll address any remaining questions and
          provide additional resources to help you settle in.
        </p>
        <p>
          We're here to support you at every step! If you have any questions
          before your start date, feel free to reach out.
        </p>
        <p>
          We look forward to welcoming you to Vision Group and can't wait to see
          you thrive!
        </p>
      </div>
    </div>
  );
}

function AgendaItem({ imgSrc, time, title, description }) {
  let formattedTime = "Any Time";

  if (time && typeof time === "string" && time.includes(":")) {
    const dateObj = new Date(`2000-01-01T${time}`);
    if (!isNaN(dateObj.getTime())) {
      formattedTime = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
  }

   const imgUrl = imgSrc?.startsWith("http")
  ? imgSrc
  : `https://localhost:7264/${imgSrc}`;

  return (
    <div className="agenda-card">

      

      {imgUrl ? (
       <img src={imgUrl} alt={title} className="agenda-img" />
      ) : (
        <div className="agenda-img placeholder">No Image</div>
      )}
      <div className="agenda-text">
        <h3>{formattedTime} | {title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default Onboarding;


