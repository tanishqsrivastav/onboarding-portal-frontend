import React               from "react";
import dayjs               from "dayjs";
import axiosInstance       from "./axiosInstance";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Upload,
  Row,
  Col,
  Button,
  message,
}                          from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
}                          from "@ant-design/icons";
import "./EmployeeCreateDto.css";

const DATE_FMT  = "YYYY-MM-DD";
const TIME_FMT  = "HH:mm";

const EmployeeCreateDto = () => {
  const [form] = Form.useForm();

  /** map <Upload> event → raw file object */
  const normFile = (e) =>
    Array.isArray(e) ? e : e?.fileList?.[0]?.originFileObj ?? null;

  const onFinish = async (values) => {
    try {
      const {
        employeeName,
        employeeStartDate,
        joiningTime,
        location,
        pointOfContact,
        agendaItems,
      } = values;

      const fd = new FormData();
      fd.append("EmployeeName",      employeeName);
      fd.append("EmployeeStartDate", employeeStartDate.format(DATE_FMT));
      fd.append("JoiningTime",       joiningTime.format(TIME_FMT));
      fd.append("Location",          location);
      fd.append("PointOfContact",    pointOfContact);

      agendaItems.forEach((item, i) => {
        fd.append(`AgendaItems[${i}].Title`,     item.title);
        fd.append(`AgendaItems[${i}].SubTitle`,  item.subTitle ?? "");
        fd.append(`AgendaItems[${i}].Time`,      item.time.format(TIME_FMT));
        if (item.image)
          fd.append(`AgendaItems[${i}].AgendaImage`, item.image);
      });

      const { data } = await axiosInstance.post(
        "https://localhost:7264/Onboarding/add-complete-employee",
        fd,
      );

      message.success(`Employee saved (ID: ${data.employeeId})`);
      form.resetFields();
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err.message);
      message.error("Error saving employee");
    }
  };

  return (
    <div className="employee-form">
      <h2>Add Employee</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          employeeStartDate: dayjs(),
          agendaItems: [{ title: "", subTitle: "", time: dayjs(), image: null }],
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="employeeName"
              label="Employee Name"
              rules={[{ required: true, message: "Employee name is required" }]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="employeeStartDate"
              label="Start Date"
              rules={[{ required: true, message: "Start date is required" }]}
            >
              <DatePicker style={{ width: "100%" }} format={DATE_FMT} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="joiningTime"
              label="Joining Time"
              rules={[{ required: true, message: "Joining time is required" }]}
            >
              <TimePicker style={{ width: "100%" }} format={TIME_FMT} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Location is required" }]}
            >
              <Input placeholder="Gurugram" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="pointOfContact"
              label="Point of Contact"
              rules={[{ required: true, message: "POC is required" }]}
            >
              <Input placeholder="Anita Sharma" />
            </Form.Item>
          </Col>
        </Row>

        <h3 style={{ marginTop: 24 }}>Agenda Items</h3>
        <Form.List name="agendaItems">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }, idx) => (
                <Row gutter={12} key={key} align="top">
                  <Col xs={24} md={5}>
                    <Form.Item
                      {...rest}
                      name={[name, "title"]}
                      rules={[{ required: true, message: "Title required" }]}
                    >
                      <Input placeholder="Title" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={5}>
                    <Form.Item {...rest} name={[name, "subTitle"]}>
                      <Input placeholder="Subtitle" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={4}>
                    <Form.Item
                      {...rest}
                      name={[name, "time"]}
                      rules={[{ required: true, message: "Time required" }]}
                    >
                      <TimePicker style={{ width: "100%" }} format={TIME_FMT} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item
                      {...rest}
                      name={[name, "image"]}
                      valuePropName="file"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />}>Image</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={2} style={{ paddingTop: 8 }}>
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ fontSize: 18 }}
                      />
                    )}
                  </Col>
                </Row>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  block
                >
                  Add Agenda
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button type="primary" htmlType="submit" size="large">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EmployeeCreateDto;
