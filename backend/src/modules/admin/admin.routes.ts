import { Router } from "express";
import * as ctrl from "./admin.controller";

const router = Router();

// Platform stats
router.get("/stats", ctrl.getStats);
router.get("/analytics", ctrl.getAnalytics);

// Doctor management
router.get("/doctors", ctrl.getAllDoctors);

// Phase 1 actions
router.patch("/doctors/:id/approve-phase1", ctrl.approvePhase1);
router.patch("/doctors/:id/reject-phase1", ctrl.rejectPhase1);

// Phase 2 actions
router.patch("/doctors/:id/approve-phase2", ctrl.approvePhase2);
router.patch("/doctors/:id/reject-phase2", ctrl.rejectPhase2);

// Phase 3 — appointment toggle
router.patch("/doctors/:id/toggle-appointments", ctrl.toggleAppointments);

// Account activation (ban/unban — separate from appointment toggle)
router.patch("/doctors/:id/activate", ctrl.activateDoctor);
router.patch("/doctors/:id/deactivate", ctrl.deactivateDoctor);

// Patient management
router.get("/patients", ctrl.getAllPatients);

// Appointment management
router.get("/appointments", ctrl.getAllAppointments);
router.patch("/appointments/:id/cancel", ctrl.cancelAppointment);

export default router;
