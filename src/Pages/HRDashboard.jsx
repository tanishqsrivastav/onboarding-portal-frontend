import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../redux/slices/employeeSlice";
import "@ant-design/v5-patch-for-react-19";
import { ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { Spin } from "antd";


import { Form,Input, DatePicker, Button, Row, Col, Space, Collapse, Modal, Card, Avatar, message,
} from "antd";
import {UserOutlined,EnvironmentOutlined,CalendarOutlined,TeamOutlined,IdcardOutlined,} from "@ant-design/icons";
import moment from "moment";
import "./HRDashboard.css";
import EditEmployee from "./EditEmployee";
import EmployeeCreateDto from "./EmployeeCreateDto";

const { Panel } = Collapse;

const HRDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const employees = useSelector((state) => state.employee.employees);
  const loading = useSelector((state) => state.employee.status === "loading");
  const error = useSelector((state) => state.employee.error);
const [isNavigating, setIsNavigating] = useState(false);

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [form] = Form.useForm();
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [role, setRole] = useState(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, [dispatch]);

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

const handleRowClick = (employeeId) => {
  setIsNavigating(true);
  setTimeout(() => {
    navigate(`/Onboarding/${employeeId}`);
  }, 800); 
};

  const handleEditClick = (employeeId) => {
    setEditingEmployeeId(employeeId);
  };

  const closeEditModal = () => {
    setEditingEmployeeId(null);
    dispatch(fetchEmployees());
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    dispatch(fetchEmployees());
  };

  const handleDelete = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `https://localhost:7264/Onboarding/delete-employee/${employeeId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      Modal.success({ content: `Employee ID ${employeeId} has been deleted.` });
      dispatch(fetchEmployees());
    } catch (err) {
      console.error("Error deleting employee:", err);
      Modal.error({
        title: "Delete failed",
        content: `Something went wrong while deleting employee ${employeeId}.`,
      });
    }
  };

  const showDeleteConfirm = (employeeId) => {
    Modal.confirm({
      title: `Do you want to delete Employee ID ${employeeId}?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      onOk() {
        handleDelete(employeeId);
      },
    });
  };

  const handleGenerateEmail = (employee) => {
    setSelectedEmployee(employee);
    setEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleCopyEmail = () => {
    if (!selectedEmployee) return;

    const toAddress = `${selectedEmployee.employeeId}ID@visiongroup.com`;
    const subject = "Welcome to Vision Group – Your Onboarding Details";
    const body = `Dear ${selectedEmployee.employeeName},\n\nWelcome to Vision Group!\n\nYour official joining date is ${new Date(
      selectedEmployee.startDate
    ).toLocaleDateString()}. Your primary point of contact during onboarding will be ${selectedEmployee.pointOfContact}.\n\nIf you have any questions before your start date, please feel free to reach out.\n\nWe look forward to working with you.\n\nBest regards,\nVision Group HR Team`;

    const fullEmail = `To: ${toAddress}\nSubject: ${subject}\n\n${body}`;

    navigator.clipboard
      .writeText(fullEmail)
      .then(() => message.success("Email copied to clipboard"))
      .catch(() => message.error("Failed to copy email"));
  };

  const getStatusBadge = (startDate) => {
    if (!startDate) return <span className="status-badge unknown">Unknown</span>;
    const now = new Date();
    const start = new Date(startDate);
    if (start > now) return <span className="status-badge upcoming">Upcoming</span>;
    if (start.toDateString() === now.toDateString()) return <span className="status-badge today">Joining Today</span>;
    return <span className="status-badge active">Active</span>;
  };

  const exportToCSV = (data) => {
    const headers = ["ID", "Name", "Start Date", "Location", "POC", "Agenda Count"];
    const rows = data.map((emp) => [
      emp.employeeId,
      emp.employeeName,
      emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "N/A",
      emp.location || "N/A",
      emp.pointOfContact || "N/A",
      emp.agendaCount || 0,
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employee_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const filterData = useCallback(
  (values) => {
    const name = values.employeeName?.trim().toLowerCase() || "";
    const location = values.location?.trim().toLowerCase() || "";
    const poc = values.pointOfContact?.trim().toLowerCase() || "";
    const startDate = values.startDate;
    const endDate = values.endDate;

    const filtered = employees.filter((emp) => {
      const matchesName = !name || emp.employeeName?.toLowerCase().includes(name);
      const matchesLocation = !location || emp.location?.toLowerCase().includes(location);
      const matchesPOC = !poc || emp.pointOfContact?.toLowerCase().includes(poc);
      const matchesDate =
        (!startDate || !endDate) ||
        (moment(emp.startDate).isSameOrAfter(startDate, "day") &&
         moment(emp.startDate).isSameOrBefore(endDate, "day"));

      return matchesName && matchesLocation && matchesPOC && matchesDate;
    });

    setFilteredEmployees(filtered);
  },
  [employees]
);

const onFinish = (values) => {
  filterData(values);
};

const resetFilters = () => {
  form.resetFields();
  setFilteredEmployees(employees);
};

  const filterFields = [
    { name: "employeeName", label: "Employee Name", placeholder: "Enter name" },
    { name: "location", label: "Location", placeholder: "Enter location" },
    {
      name: "pointOfContact",
      label: "Point of Contact",
      placeholder: "Enter point of contact",
    },
  ];

  const renderEmployeeRows = () =>
    filteredEmployees.length === 0 ? (
     <tr>
  <td colSpan={role === "HR" ? 9 : 8} className="no-results">
    No employees found.
  </td>
</tr>

    ) : (
      filteredEmployees.map((emp) => (

        <tr key={emp.employeeId}>
          <td>{emp.employeeId}</td>
          <td>{emp.employeeName}</td>
          <td>
            {emp.startDate ? new Date(emp.startDate).toLocaleDateString() : "N/A"}
          </td>
          <td>{emp.location || "N/A"}</td>
          <td>{emp.pointOfContact || "N/A"}</td>
          <td style={{ textAlign: "center" }}>{emp.agendaCount}</td>
            <td>{getStatusBadge(emp.startDate)}</td> 
          {role === "HR" && (
            <td style={{ textAlign: "center", verticalAlign: "middle" }}>
              <Space>
                <Button type="link" onClick={() => handleEditClick(emp.employeeId)}>
                  ✏️ Edit
                </Button>
                <Button
                  type="link"
                  danger
                  onClick={() => showDeleteConfirm(emp.employeeId)}
                >
                  🗑️ Delete
                </Button>
              </Space>
            </td>
          )}
          <td style={{ textAlign: "center", verticalAlign: "middle" }}>
            <Space>
              <Button type="primary" onClick={() => handleRowClick(emp.employeeId)}>
                Generate
              </Button>
              <Button onClick={() => handleGenerateEmail(emp)}>📩 Emailer</Button>
            </Space>
          </td>
        </tr>
      ))
    );

  const EmployeeCard = ({ employee }) => {
    const {
      employeeName,
      location,
      startDate,
      pointOfContact,
      profileImage,
      employeeId,
    } = employee;

    return (
      <Card
        hoverable
        style={{
          width: 280,
          borderRadius: 16,
          boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
          marginBottom: 16,
        }}
        cover={
          <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
            <Avatar size={96} src={profileImage} icon={<UserOutlined />} />
          </div>
        }
      >
        <p>
          <IdcardOutlined /> <strong>ID:</strong> {employeeId}
        </p>
        <p>
          <UserOutlined /> <strong>{employeeName}</strong>
        </p>
        <p>
          <EnvironmentOutlined /> Location: {location || "N/A"}
        </p>
        <p>
          <CalendarOutlined /> Start Date:{" "}
          {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
        </p>
        <p>
          <TeamOutlined /> POC: {pointOfContact || "N/A"}
        </p>

        <Space style={{ marginTop: 16 }}>
          <Button size="small" onClick={() => handleRowClick(employeeId)}>
            View
          </Button>
          {role === "HR" && (
            <>
              <Button size="small" onClick={() => handleEditClick(employeeId)}>
                Edit
              </Button>
              <Button
                type="link"
                danger
                onClick={() => showDeleteConfirm(employee.employeeId)}
              >
                🗑️ Delete
              </Button>
            </>
          )}
        </Space>
      </Card>
    );
  };

  return (
  <>
  {isNavigating && (
    <div className="global-spinner-overlay">
      <Spin size="large" tip="Loading..." />
    </div>
  )}

    <div className="hr-dashboard-container">


      <Row justify="space-between" align="middle" className="header-row">
        <Col>
          <img
            src="https://i.ibb.co/JRsBtHX8/Vision-Group-1.png"
            alt="Vision Group Logo"
            className="header-logo"
          />
        </Col>

<Col>
  <Space className="action-buttons">
    {role === "HR" && (
      <Button type="primary" onClick={openAddModal}>
        ➕ Add Employee
      </Button>
    )}
    <Button onClick={() => exportToCSV(filteredEmployees)}>
      📤 Export CSV
    </Button>
    <Button danger onClick={handleLogout}>
      🚪 Logout
    </Button>
  </Space>
</Col>
     
      </Row>
      <h2 className="dashboard-title">HR Dashboard</h2>
      <Collapse className="dashboard-form">
        <Panel header={<strong>🔍 Filter Employees</strong>} key="1">
          <div className="filter-panel-scroll">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                {filterFields.map(({ name, label, placeholder }) => (
                  <Col span={6} key={name}>
                    <Form.Item name={name} label={label}>
                      <Input placeholder={placeholder} />
                    </Form.Item>
                  </Col>
                ))}
                <Col span={6}>
                  <Form.Item label="Start & End Date">
                    <Row gutter={[0, 8]}>
                      <Col span={24}>
                        <Form.Item name="startDate" noStyle>
                          <DatePicker style={{ width: "100%" }} placeholder="Start Date" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="endDate" noStyle>
                          <DatePicker style={{ width: "100%" }} placeholder="End Date" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>

              <Row justify="end">
                <Col>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        height: "40px",
                        padding: "0 20px",
                        fontWeight: 600,
                        lineHeight: "40px",
                         marginTop: "-0px", 
                      }}
                    >
                      Apply Filters
                    </Button>
                    <Button
                      style={{
                        height: "40px",
                        padding: "0 20px",
                        fontWeight: 600,
                        lineHeight: "40px",
                      }}
                      onClick={resetFilters}
                    >
                      Reset
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </Panel>
      </Collapse>

      <div style={{ display: "flex", justifyContent: "center", margin: "30px 0" }}>
        <Button
          type="default"
          size="large"
          onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
          style={{
            fontWeight: 600,
            backgroundColor: "#ffffff",
            color: "#333",
            border: "1px solid #d9d9d9",
            padding: "10px 24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            marginLeft: "17px",
          }}
        >
          🔄 Switch to {viewMode === "table" ? "Card" : "Table"} View
        </Button>
      </div>

      {loading && <p>Loading employees...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}



      {viewMode === "table" && (
        <table className="employee-table">
          <thead>
  <tr>
    <th>ID</th>
    <th>Employee Name</th>
    <th>Start Date</th>
    <th>Location</th>
    <th>Point of Contact</th>
    <th>Agenda Count</th>
    <th>Status</th>
    {role === "HR" && (
      <th style={{ textAlign: "center" }}>Edit / Delete Actions</th>
    )}
    <th style={{ textAlign: "center" }}>Employee Onboarding Actions</th>
  </tr>
</thead>

          <tbody>{renderEmployeeRows()}</tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="employee-card-container">
          {filteredEmployees.length === 0 ? (
            <p style={{ textAlign: "center", width: "100%" }}>No employees found.</p>
          ) : (
            filteredEmployees.map((emp) => <EmployeeCard key={emp.employeeId} employee={emp} />)
          )}
        </div>
      )}

      <Modal
       
        open={!!editingEmployeeId}
        onCancel={closeEditModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        {editingEmployeeId && (
          <EditEmployee employeeId={editingEmployeeId} onClose={closeEditModal} />
        )}
      </Modal>

      <Modal
        title="Add Employee"
        open={isAddModalOpen}
        onCancel={closeAddModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EmployeeCreateDto onClose={closeAddModal} />
      </Modal>

      <Modal
        title="📧 Onboarding Email Preview"
        open={emailModalOpen}
        onCancel={closeEmailModal}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyEmail}>
            Copy
          </Button>,
          <Button key="close" onClick={closeEmailModal}>
            Close
          </Button>,
        ]}
      >
        {selectedEmployee && (
          <div>
            <p>
              <strong>To:</strong> {`${selectedEmployee.employeeId}ID@visiongroup.com`}
            </p>
            <p> 
              <strong>Subject:</strong> Welcome to Vision Group – Your Onboarding Details
            </p>
            <p>Dear {selectedEmployee.employeeName},</p>
            <p>
              Welcome to Vision Group! Your official joining date is{" "}
              <strong>{new Date(selectedEmployee.startDate).toLocaleDateString()}</strong>.
              Your primary point of contact during onboarding will be{" "}
              <strong>{selectedEmployee.pointOfContact}</strong>.
            </p>
            <p>
              Should you have any questions before your start date, please feel free to
              reach out.
            </p>
            <p>We look forward to working with you.</p>
            <p>Best regards,</p>
            <p>Vision Group HR Team</p>
          </div>
        )}
      </Modal>
     
    </div>
  </>
  ); 
};

export default HRDashboard;


