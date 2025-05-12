
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Users/Profile';
import SignIn from './pages/Authentication/SignIn';
import Layout from './layout/layout';
import SignUp from './pages/Forms/SignUp';
import RestrictedRoute from './components/RestrictedRoute';
import Managers from './pages/RolesManagement/Managers';
import Teachers from './pages/RolesManagement/Teachers';
import Students from './pages/RolesManagement/Students';
import DeletedUsers from './pages/RecycleBin/DeletedUsers';
import RolesIndustry from './pages/ManagementIndustry/RolesIndustry,';
import EditUser from './pages/EditPage/EditUser';
import SubjectForm from './pages/Forms/SubjectForm';
import Subjects from './pages/EditList/Subjects';
import DeletedSubjects from './pages/RecycleBin/DeletedSubjects';
import EditSubject from './pages/EditPage/EditSubject';
import AssignmentForm from './pages/Forms/AssignmentForm';
import Assignments from './pages/EditList/Assignments';
import DeletedAssignments from './pages/RecycleBin/DeletedAssignments';
import EditAssignment from './pages/EditPage/EditAssignment';
import RequestForm from './pages/Forms/RequestForm';
import RequestFormIndustry from './pages/ManagementIndustry/RequestFormIndustry';
import ViewRequestForm from './pages/ViewPage/ViewRequestForm';
import DeletedRequestForms from './pages/RecycleBin/DeletedRequestForms';
import NotificationForm from './pages/Forms/NotificationForm';
import EditNotification from './pages/EditPage/EditNotification';
import Notifications from './pages/EditList/Notifications';
import DeletedNotifications from './pages/RecycleBin/DeletedNotifications';
import SubmissionForm from './pages/SubmissionManagement/SubmissionForm';
import SubmissionManagement from './pages/SubmissionManagement/SubmissionManagement';
import SubmissionList from './pages/SubmissionManagement/SubmissionList';
import ViewSubmissionDetails from './pages/SubmissionManagement/ViewSubmissionDetails';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignIn />} />


        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assignments" element={<Assignments />} />


            {/* Restricted to admin/manager only */}
            <Route element={<RestrictedRoute allowedRoles={['admin', 'manager']} />}>
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/managers" element={<Managers />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/students" element={<Students />} />
              <Route path="/management/roles" element={<RolesIndustry />} />
              <Route path="/edit-user/:id" element={<EditUser />} />
              <Route path="/subject-manage" element={<Subjects />} />
              <Route path="/edit-subject/:id" element={<EditSubject />} />
              <Route path="/subjectForm" element={<SubjectForm />} />
              <Route path="/assignemntForm" element={<AssignmentForm />} />
              <Route path="/edit-assignment/:id" element={<EditAssignment />} />
              
              <Route path="/submitManagement/:assignmentId" element={<SubmissionManagement />} >
                <Route index element={<SubmissionForm />} />
                <Route path="submissions" element={<SubmissionList />} />
                <Route path="submissions/:submissionId" element={<ViewSubmissionDetails />} />

              </Route>
              
              <Route path="/requestForm" element={<RequestForm />} />
              <Route path="/management/request-form" element={<RequestFormIndustry />} />
              <Route path="/view-request-form/:id" element={<ViewRequestForm />} />
              <Route path="/notificationForm" element={<NotificationForm />} />
              <Route path="/editNotification/:id" element={<EditNotification />} />
              <Route path="/notifications" element={<Notifications />} />

            </Route>
            <Route element={<RestrictedRoute allowedRoles={['admin']} />}>
              <Route path="/recycle-bin/users" element={<DeletedUsers />} />
              <Route path="/recycle-bin/subjects" element={<DeletedSubjects />} />
              <Route path="/recycle-bin/assignments-bin" element={<DeletedAssignments />} />
              <Route path="/recycle-bin/request-forms" element={<DeletedRequestForms />} />
              <Route path="/recycle-bin/notifications" element={<DeletedNotifications />} />
            </Route>

            {/* Add other protected routes here */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}