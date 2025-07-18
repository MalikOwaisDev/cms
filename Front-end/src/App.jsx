import { Routes, Route, Navigate } from "react-router-dom";

// Authentication
import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";
import AdminProtectWrapper from "./auth/AdminProtectWrapper";

// Dashboard
import Dashboard from "./Dashboard";
import ProfilePage from "./Profile";

// Training
import TrainingList from "./training/TrainingList";
import TrainingForm from "./training/TrainingForm";
import TrainingHistory from "./training/TrainingHistory";
import TrainingDetails from "./training/TrainingDetails";
import TrainingEditDetails from "./training/TrainingEditDetails";

// Invoicing
import InvoiceList from "./invoices/InvoiceList";
import CreateInvoice from "./invoices/CreateInvoice";
import InvoiceDetails from "./invoices/InvoiceDetails";
import EditInvoice from "./invoices/EditInvoice";

// Wellness
import CarePlanForm from "./wellness/CarePlanForm";
import CarePlanList from "./wellness/CarePlanList";
import ResourceList from "./wellness/ResourceList";
import EditCarePlan from "./wellness/EditCarePlan";
import CreateResource from "./wellness/CreateResource";

// Patient (optional)
import PatientList from "./patients/ListPatients";
import PatientForm from "./patients/PatientForm";
import PatientDetails from "./patients/PatientDetails";
import PatientEditPage from "./patients/PatientEditDetails";

//Visits
import VisitForm from "./visit/VisitForm";
import VisitsPage from "./visit/VisitsPage";
import ViewVisitPage from "./visit/ViewVisitPage";

//caregivers
import ListCaregivers from "./caregivers/ListCaregivers";
import ViewCaregiver from "./caregivers/ViewCaregiver";
import EditCaregiver from "./caregivers/EditCaregiver";
import NewCaregiver from "./caregivers/NewCaregiver";

// Fallback
import NotFound from "./NotFound";

// import Loader from "./Loader";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Training */}
      <Route path="/trainings" element={<TrainingList />} />
      <Route
        path="/trainings/create"
        element={
          <AdminProtectWrapper>
            <TrainingForm />
          </AdminProtectWrapper>
        }
      />
      <Route path="/trainings/history" element={<TrainingHistory />} />
      <Route path="/trainings/view/:id" element={<TrainingDetails />} />
      <Route
        path="/trainings/edit/:id"
        element={
          <AdminProtectWrapper>
            <TrainingEditDetails />
          </AdminProtectWrapper>
        }
      />

      {/* Invoicing */}
      <Route
        path="/invoices"
        element={
          <AdminProtectWrapper>
            <InvoiceList />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/invoices/create"
        element={
          <AdminProtectWrapper>
            <CreateInvoice />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <AdminProtectWrapper>
            <InvoiceDetails />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/invoices/edit/:id"
        element={
          <AdminProtectWrapper>
            <EditInvoice />
          </AdminProtectWrapper>
        }
      />

      {/* Wellness */}
      <Route path="/wellness/plans" element={<CarePlanList />} />
      <Route path="/wellness/plans/:id" element={<EditCarePlan />} />
      <Route path="/wellness/plans/create" element={<CarePlanForm />} />
      <Route path="/wellness/resources" element={<ResourceList />} />
      <Route
        path="/wellness/resource/create"
        element={
          <AdminProtectWrapper>
            <CreateResource />
          </AdminProtectWrapper>
        }
      />

      {/* Patients (optional admin view) */}
      <Route path="/patients" element={<PatientList />} />

      <Route
        path="/patients/new"
        element={
          <AdminProtectWrapper>
            <PatientForm />
          </AdminProtectWrapper>
        }
      />
      <Route path="/patients/:id" element={<PatientDetails />} />

      <Route
        path="/patients/edit/:id"
        element={
          <AdminProtectWrapper>
            <PatientEditPage />
          </AdminProtectWrapper>
        }
      />
      {/* Visits */}
      <Route
        path="/visits/create"
        element={
          <AdminProtectWrapper>
            <VisitForm />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/visits"
        element={
          <AdminProtectWrapper>
            <VisitsPage />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/visits/view/:id"
        element={
          <AdminProtectWrapper>
            <ViewVisitPage />
          </AdminProtectWrapper>
        }
      />

      {/* Caregivers */}
      <Route
        path="/caregivers"
        element={
          <AdminProtectWrapper>
            <ListCaregivers />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/caregivers/view/:id"
        element={
          <AdminProtectWrapper>
            <ViewCaregiver />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/caregivers/edit/:id"
        element={
          <AdminProtectWrapper>
            <EditCaregiver />
          </AdminProtectWrapper>
        }
      />
      <Route
        path="/caregivers/create"
        element={
          <AdminProtectWrapper>
            <NewCaregiver />
          </AdminProtectWrapper>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
