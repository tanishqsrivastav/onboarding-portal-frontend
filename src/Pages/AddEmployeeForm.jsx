import React, { useState } from 'react';
import axiosInstance from './axiosInstance';

const AddEmployeeForm = () => {
  const [employeeName, setEmployeeName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [joiningTime, setJoiningTime] = useState('');
  const [location, setLocation] = useState('');
  const [pointOfContact, setPointOfContact] = useState('');
  const [agendaItems, setAgendaItems] = useState([{ title: '', subtitle: '', time: '', image: null }]);

  const handleAgendaChange = (index, field, value) => {
    const updatedAgenda = [...agendaItems];
    updatedAgenda[index][field] = value;
    setAgendaItems(updatedAgenda);
  };

  const handleFileChange = (index, event) => {
    const updatedAgenda = [...agendaItems];
    updatedAgenda[index].image = event.target.files[0];
    setAgendaItems(updatedAgenda);4
  };

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { title: '', subtitle: '', time: '', image: null }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('EmployeeName', employeeName);
    formData.append('EmployeeStartDate', startDate);
    formData.append('JoiningTime', joiningTime);
    formData.append('Location', location);
    formData.append('PointOfContact', pointOfContact);

   
    agendaItems.forEach((agendaItem, index) => {
      formData.append(`AgendaItems[${index}].Title`, agendaItem.title);
      formData.append(`AgendaItems[${index}].SubTitle`, agendaItem.subtitle);
      formData.append(`AgendaItems[${index}].Time`, agendaItem.time);
      if (agendaItem.image) {
        formData.append(`AgendaItems[${index}].AgendaImage`, agendaItem.image);
      }
    });

    try {
      const response = await axiosInstance.post('https://localhost:7264/Onboarding/add-complete-employee', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Employee added successfully:', response.data);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Employee Name</label>
        <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
      </div>
      <div>
        <label>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label>Joining Time</label>
        <input type="time" value={joiningTime} onChange={(e) => setJoiningTime(e.target.value)} />
      </div>
      <div>
        <label>Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div>
        <label>Point of Contact</label>
        <input type="text" value={pointOfContact} onChange={(e) => setPointOfContact(e.target.value)} />
      </div>

      <div>
        <h3>Agenda Items</h3>
        {agendaItems.map((agendaItem, index) => (
          <div key={index}>
            <div>
              <label>Title</label>
              <input
                type="text"
                value={agendaItem.title}
                onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
              />
            </div>
            <div>
              <label>Subtitle</label>
              <input
                type="text"
                value={agendaItem.subtitle}
                onChange={(e) => handleAgendaChange(index, 'subtitle', e.target.value)}
              />
            </div>
            <div>
              <label>Time</label>
              <input
                type="time"
                value={agendaItem.time}
                onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
              />
            </div>
            <div>
              <label>Agenda Image</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(index, e)}
                accept="image/*"
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addAgendaItem}>Add Agenda Item</button>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default AddEmployeeForm;
