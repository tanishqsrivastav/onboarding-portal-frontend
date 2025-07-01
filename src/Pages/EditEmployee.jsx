import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  message,
  DatePicker,
  TimePicker,
  Upload,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./EditEmployee.css";

const EditEmployee = ({ employeeId: propEmployeeId, onClose }) => {
  const { employeeId: paramEmployeeId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [agendaList, setAgendaList] = useState([]);
  const employeeId = propEmployeeId || paramEmployeeId;
  const token = localStorage.getItem("token");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEmployee = async () => {
      try {
        const { data } = await axiosInstance.get(
          `https://localhost:7264/Onboarding/first-day-agenda/${employeeId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const initialAgendas = (data || []).map((agenda) => ({
          ...agenda,
          time: moment(agenda.time, "HH:mm:ss"), 
          agendaImage: agenda.agendaImage
            ? [
                {
                  uid: "-1",
                  name: "Agenda Image",
                  status: "done",
                  url: `https://localhost:7264/${agenda.agendaImage}`,
                },
              ]
            : [],
        }));

        setAgendaList(initialAgendas);
        form.setFieldsValue({ agendas: initialAgendas });
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch agenda");
        navigate("/HRDashboard");
      }
    };
    if (employeeId) fetchEmployee();
  }, [employeeId, form, navigate, token]);

  const appendAgendaToFormData = (agenda, index, formData) => {
    formData.append(`AgendaItems[${index}].Title`, agenda.title || "");
    formData.append(`AgendaItems[${index}].SubTitle`, agenda.subTitle || "");
    formData.append(
      `AgendaItems[${index}].Time`,
      agenda.time ? agenda.time.format("HH:mm:ss") : ""
    );
    const file = agenda.agendaImage?.[0]?.originFileObj;
    if (file) formData.append(`AgendaItems[${index}].AgendaImage`, file);
  };
  const onFinish = async (values) => {
    const { agendas, employeeName, location, startDate, pointOfContact } =
      values;

    if (!startDate || !moment(startDate).isValid())
      return message.error("Please select a valid start date");

    const formData = new FormData();
    formData.append("EmployeeName", employeeName);
    formData.append("EmployeeStartDate", startDate.format("YYYY-MM-DD")); 
    formData.append("JoiningTime", startDate.format("HH:mm:ss")); 
    formData.append("Location", location);
    formData.append("PointOfContact", pointOfContact);

    (agendas || []).forEach((agenda, idx) =>
      appendAgendaToFormData(agenda, idx, formData)
    );

    try {
      await axiosInstance.put(
        `https://localhost:7264/Onboarding/update-employee/${employeeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Saved successfully!");
      onClose ? onClose() : navigate("/HRDashboard");
    } catch (err) {
      console.error(err);
      message.error("Save failed.");
    }
  };
  return (
    <div className="edit-employee-container">
      <h2>Edit Employee</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employeeName"
              label="Employee Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true }]}
            >
              <Input placeholder="Location" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                placeholder="Select date"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="pointOfContact"
              label="Point of Contact"
              rules={[{ required: true }]}
            >
              <Input placeholder="POC" />
            </Form.Item>
          </Col>
        </Row>

        <Form.List
          name="agendas"
          rules={[
            {
              validator: async (_, agendas) => {
                if (!agendas || agendas.length < 1)
                  throw new Error("At least one agenda is required");
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              <h3>Agendas</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="agenda-item-row">
                  <Form.Item
                    {...restField}
                    name={[name, "title"]}
                    label="Title"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Title" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "subTitle"]}
                    label="Subtitle"
                  >
                    <Input placeholder="Subtitle" />
                  </Form.Item>

                  {/* ⏰ Time picker – time only */}
                  <Form.Item
                    {...restField}
                    name={[name, "time"]}
                    label="Time"
                    rules={[{ required: true }]}
                  >
                    <TimePicker
                      format="HH:mm"
                      use12Hours={false}
                      minuteStep={5}
                      style={{ width: "100%" }}
                      placeholder="Select time"
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "agendaImage"]}
                    label="Agenda Image"
                    valuePropName="fileList"
                    getValueFromEvent={(e) =>
                      Array.isArray(e) ? e : e?.fileList
                    }
                  >
                    <Upload
                      listType="picture-card"
                      accept="image/*"
                      maxCount={1}
                      beforeUpload={(file) => {
                        const isImg = file.type.startsWith("image/");
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isImg) message.error("Only images allowed");
                        if (!isLt2M) message.error("Max 2 MB limit");
                        return false; // prevent auto-upload
                      }}
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </div>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Agenda
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        {form.getFieldValue("agendas")?.map((agenda, idx) => {
          const url = agenda.agendaImage?.[0]?.url;
          return url ? (
            <img
              key={idx}
              src={url}
              alt="agenda"
              style={{ width: 150, margin: "8px 0" }}
            />
          ) : null;
        })}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditEmployee;
