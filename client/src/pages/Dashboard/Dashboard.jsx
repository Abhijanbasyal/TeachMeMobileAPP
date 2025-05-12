

import React, { useEffect, useState } from 'react';
import {
  FaUserTie,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaFileAlt,
  FaBook,
  FaTasks, // Add for assignments
  FaFileUpload, // Add for submissions
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import APIEndPoints from '../../middleware/ApiEndPoints';
import { useSelector } from 'react-redux';
import api from '../../utils/api.js';

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    users: { admins: 0, managers: 0, teachers: 0, students: 0, total: 0 },
    requestForms: { total: 0 },
    subjects: { total: 0 },
    assignments: { total: 0 }, // Add assignments
    submissions: { total: 0 }, // Add submissions
  });
  const [monthlyRequestForms, setMonthlyRequestForms] = useState([]);
  const [subjectStats, setSubjectStats] = useState({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic subject data for Pie Chart
  const subjectData = [
    { name: 'Active ', value: subjectStats.active || 0 },
    { name: 'Inactive ', value: subjectStats.inactive || 0 },
  ];

  const COLORS = ['#3D3BF3', '#9694FF'];

   useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const response = await api.get(APIEndPoints.get_dashboard_stats.url);
        setStats(response.data.data);

        // Fetch monthly request forms
        const monthlyResponse = await api.get(APIEndPoints.get_monthly_request_forms.url);
        console.log('Monthly Response:', monthlyResponse.data);

        // Format data for chart
        const formattedData = monthlyResponse.data.data.map(item => ({
          name: new Date(2023, item.month - 1).toLocaleString('default', { month: 'short' }),
          forms: item.count,
        }));

        console.log('Formatted Data:', formattedData);
        setMonthlyRequestForms(formattedData);

        // Fetch subject stats for Pie Chart
        const subjectStatsResponse = await api.get(APIEndPoints.get_subject_stats.url);
        setSubjectStats(subjectStatsResponse.data.data);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const StatCard = ({ title, count, icon: Icon, bgColor }) => (
    <div className={`p-6 rounded-lg shadow-md ${bgColor} text-white flex items-center space-x-4`}>
      <Icon className="text-3xl" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl">{count}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-tertiary p-8">
      <h1 className="text-3xl font-bold text-primary mb-8">
        <span className="uppercase">{currentUser.roles}</span> Dashboard
      </h1>

      {loading && <p className="text-center text-primary">Loading...</p>}
      {error && <p className="text-center text-error">{error}</p>}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Admins" count={stats.users.admins} icon={FaUserShield} bgColor="bg-primary" />
        <StatCard title="Managers" count={stats.users.managers} icon={FaUserTie} bgColor="bg-primary" />
        <StatCard title="Teachers" count={stats.users.teachers} icon={FaChalkboardTeacher} bgColor="bg-primary" />
        <StatCard title="Students" count={stats.users.students} icon={FaUserGraduate} bgColor="bg-primary" />
        <StatCard title="Request Forms" count={stats.requestForms.total} icon={FaFileAlt} bgColor="bg-primary" />
        <StatCard title="Subjects" count={stats.subjects.total} icon={FaBook} bgColor="bg-primary" />
        <StatCard title="Assignments" count={stats.assignments.total} icon={FaTasks} bgColor="bg-primary" />
        <StatCard title="Submissions" count={stats.submissions.total} icon={FaFileUpload} bgColor="bg-primary" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart for Request Forms */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-primary mb-4">Request Forms (Monthly)</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-tertiary rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-64 bg-tertiary rounded"></div>
                    <div className="h-4 bg-tertiary rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-error">
              <p>Failed to load chart data</p>
              <button
                onClick={() => fetchDashboardData()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="relative">
              <BarChart
                width={600}
                height={300}
                data={monthlyRequestForms}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEAFF" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  interval={0}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    borderColor: '#EBEAFF',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: '#3D3BF3' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Bar
                  dataKey="forms"
                  radius={[4, 4, 0, 0]}
                  background={{ fill: '#EBEAFF', radius: 4 }}
                >
                  {monthlyRequestForms.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? '#3D3BF3' : '#9694FF'}
                      strokeWidth={0}
                    />
                  ))}
                </Bar>
              </BarChart>
              <div className="absolute top-0 right-0 flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
                  <span className="text-xs text-gray-500">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-secondary mr-1"></div>
                  <span className="text-xs text-gray-500">Previous</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie Chart for Subjects */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-primary mb-4">Subjects Distribution</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-tertiary rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-64 bg-tertiary rounded"></div>
                    <div className="h-4 bg-tertiary rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-error">
              <p>Failed to load chart data</p>
              <button
                onClick={() => fetchDashboardData()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <PieChart width={400} height={300}>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;