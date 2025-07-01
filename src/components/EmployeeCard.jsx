import React from "react";
import '@ant-design/v5-patch-for-react-19';
import { Card, Button, Space, Avatar } from "antd";
import { UserOutlined, EnvironmentOutlined, CalendarOutlined, TeamOutlined } from "@ant-design/icons";
import "./EmployeeCard.css"; 

const EmployeeCard = ({ employee, onView, onEdit, onDelete, isAdmin }) => {
  const { employeeName, location, startDate, pointOfContact, profileImage } = employee;

  return (
    <Card
      className="employee-card"
      hoverable
      style={{
        width: 300,
        borderRadius: 16,
        boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
      }}
      cover={
        <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
          <Avatar size={96} src={profileImage} icon={<UserOutlined />} />
        </div>
      }
    >
      <p><UserOutlined /> <strong>{employeeName}</strong></p>
      <p><EnvironmentOutlined /> Location: {location || "N/A"}</p>
      <p><CalendarOutlined /> Start Date: {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}</p>
      <p><TeamOutlined /> POC: {pointOfContact || "N/A"}</p>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>
        <Button size="small" onClick={onView}>View</Button>
        {isAdmin && (
          <Space>
            <Button size="small" onClick={onEdit}>Edit</Button>
            <Button size="small" danger onClick={onDelete}>Delete</Button>
          </Space>
        )}
      </div>
    </Card>
  );
};

export default EmployeeCard;
