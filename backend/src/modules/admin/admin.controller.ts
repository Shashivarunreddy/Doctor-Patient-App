import { Request, Response } from "express";
import * as adminService from "./admin.service";

const handle =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response) => {
    try {
      const result = await fn(req, res);
      res.status(200).json({ success: true, data: result });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      res.status(e.status ?? 500).json({ success: false, message: e.message ?? "Internal server error" });
    }
  };

export const getStats = handle(async () => adminService.getStats());

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    const result = await adminService.getAllDoctors({ page, limit, search, status });
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    res.status(e.status ?? 500).json({ success: false, message: e.message ?? "Internal server error" });
  }
};

const requireId = (req: Request): string => {
  const id = req.params.id;
  if (typeof id !== "string") throw { status: 400, message: "Invalid ID" };
  return id;
};

// ── Phase 1 ──
export const approvePhase1 = handle(async (req) => adminService.approvePhase1(requireId(req)));

export const rejectPhase1 = handle(async (req) => {
  const { reason } = req.body as { reason?: string };
  return adminService.rejectPhase1(requireId(req), reason ?? "");
});

// ── Phase 2 ──
export const approvePhase2 = handle(async (req) => adminService.approvePhase2(requireId(req)));

export const rejectPhase2 = handle(async (req) => {
  const { reason } = req.body as { reason?: string };
  return adminService.rejectPhase2(requireId(req), reason ?? "");
});

// ── Phase 3 ──
export const toggleAppointments = handle(async (req) => {
  const { canTake } = req.body as { canTake: boolean };
  if (typeof canTake !== "boolean") throw { status: 400, message: "canTake must be a boolean" };
  return adminService.toggleAppointments(requireId(req), canTake);
});

// ── Account management ──
export const deactivateDoctor = handle(async (req) => adminService.deactivateDoctor(requireId(req)));
export const activateDoctor = handle(async (req) => adminService.activateDoctor(requireId(req)));

// ── Patients ──
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await adminService.getAllPatients({ page, limit, search });
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    res.status(e.status ?? 500).json({ success: false, message: e.message ?? "Internal server error" });
  }
};

// ── Appointments ──
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = (req.query.status as string) || "";
    const search = (req.query.search as string) || "";
    const dateFrom = (req.query.dateFrom as string) || "";
    const dateTo = (req.query.dateTo as string) || "";

    const result = await adminService.getAllAppointments({ page, limit, status, search, dateFrom, dateTo });
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    res.status(e.status ?? 500).json({ success: false, message: e.message ?? "Internal server error" });
  }
};

export const cancelAppointment = handle(async (req) => adminService.cancelAppointment(requireId(req)));

// ── Analytics ──
export const getAnalytics = handle(async (req) => {
  const period = (req.query.period as string) || "30d";
  return adminService.getAnalytics(period);
});
