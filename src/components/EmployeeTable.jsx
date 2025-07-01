
import React from "react";

function EmployeeTable({ employees }) {
  if (!employees.length) {
    return <p>No employees added yet.</p>;
  }

    return(
      <table border= "1" style={{"marginTop: 25px", width:"200%"}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>StartDate</th>
          </tr>

        </thead>
      </table>
    )
      <tbody>
        {employees.map((emp, i) => (
          <tr key={i}>
            <td>{emp.employeeName}</td>
            <td>{emp.startDate}</td>
            <td>{emp.time}</td>
            <td>{emp.location}</td>
            <td>{emp.pointOfContact}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EmployeeTable;
