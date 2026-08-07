import React, { useState, useEffect, useContext } from 'react';
import { getEmployeesApi, createEmployeeApi } from '../../api/adminApi';
import { AuthContext } from '../../context/AuthContext';
import { Users, Plus, Shield, Mail, Briefcase } from 'lucide-react';

export default function EmployeeManager() {
  const { token } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Fashion Design',
    designation: 'Staff Stylist',
    salary: 3500
  });

  const loadEmployees = () => {
    setLoading(true);
    getEmployeesApi(token)
      .then(res => {
        if (res.success) setEmployees(res.employees);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createEmployeeApi(token, { ...formData, salary: Number(formData.salary) });
    if (res.success) {
      setShowModal(false);
      loadEmployees();
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white space-y-6">
      
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-900" /> Employee & Staff Management (Epic 4)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage staff roles, designations, and salary records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl gradient-button text-xs font-bold text-white flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {showModal && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Add New Staff Member</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border rounded-xl py-2 px-3 text-slate-900" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border rounded-xl py-2 px-3 text-slate-900" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-white border rounded-xl py-2 px-3 text-slate-900" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation</label>
              <input type="text" required value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full bg-white border rounded-xl py-2 px-3 text-slate-900" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl gradient-button text-xs text-white font-bold">Save Staff</button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-bold text-slate-700">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-6 text-xs text-slate-400">Loading staff records...</div>
      ) : (
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 font-bold text-slate-700 uppercase border-b">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td className="py-3 px-4 font-bold text-slate-900">{emp.name} <span className="block text-[10px] text-slate-400 font-normal">{emp.email}</span></td>
                <td className="py-3 px-4 text-slate-600 font-medium">{emp.department}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{emp.designation}</td>
                <td className="py-3 px-4 font-extrabold text-slate-900">${emp.salary.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
