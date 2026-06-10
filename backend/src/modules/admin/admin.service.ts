import { prisma } from "../../config/prisma";
import { DoctorApprovalStatus } from "@prisma/client";

/** Platform-wide stats for the admin overview card */
export const getStats = async () => {
  const [
    totalDoctors,
    activeDoctors,
    phase1Pending,
    phase2Pending,
    totalPatients,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    revenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.user.count({
      where: {
        role: "DOCTOR",
        isActive: true,
        doctorProfile: { approvalStatus: DoctorApprovalStatus.PHASE2_APPROVED },
      },
    }),
    prisma.user.count({
      where: {
        role: "DOCTOR",
        doctorProfile: { approvalStatus: DoctorApprovalStatus.PHASE1_PENDING },
      },
    }),
    prisma.user.count({
      where: {
        role: "DOCTOR",
        doctorProfile: { approvalStatus: DoctorApprovalStatus.PHASE2_PENDING },
      },
    }),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "CONFIRMED" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "PAID" } }),
  ]);

  return {
    totalDoctors,
    activeDoctors,
    // Total pending = Phase 1 + Phase 2
    pendingApprovals: phase1Pending + phase2Pending,
    phase1Pending,
    phase2Pending,
    totalPatients,
    totalAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    totalRevenue: revenue._sum.amount ?? 0,
  };
};

/** All doctors (including inactive and unapproved, with pagination, search, and status filter) */
export const getAllDoctors = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search ?? "";
  const status = params?.status ?? "";

  const where: any = { role: "DOCTOR" };

  if (status) {
    where.doctorProfile = { approvalStatus: status };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, doctors] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        doctorProfile: {
          select: {
            approvalStatus: true,
            rejectionReason: true,
            phase2RejectionReason: true,
            specializations: true,
            experience: true,
            consultationFee: true,
            qualifications: true,
            licenseNumber: true,
            canTakeAppointments: true,
            phone: true,
          },
        },
        _count: { select: { doctorAppointments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: doctors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────── PHASE 1 ───────────────

/** Approve Phase 1 — doctor can now log in and submit full profile */
export const approvePhase1 = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };
  if (profile.approvalStatus !== DoctorApprovalStatus.PHASE1_PENDING) {
    throw { status: 400, message: "Doctor is not in Phase 1 pending state" };
  }

  await prisma.$transaction([
    prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: { approvalStatus: DoctorApprovalStatus.PHASE1_APPROVED, rejectionReason: null },
    }),
    prisma.user.update({ where: { id: doctorId }, data: { isActive: true } }),
  ]);

  return { message: "Phase 1 approved. Doctor can now log in and submit professional details." };
};

/** Reject Phase 1 — doctor cannot log in */
export const rejectPhase1 = async (doctorId: string, reason: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: { approvalStatus: DoctorApprovalStatus.REJECTED, rejectionReason: reason || null },
  });

  return { message: "Doctor Phase 1 application rejected." };
};

// ─────────────── PHASE 2 ───────────────

/** Approve Phase 2 — doctor is fully verified */
export const approvePhase2 = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };
  if (profile.approvalStatus !== DoctorApprovalStatus.PHASE2_PENDING) {
    throw { status: 400, message: "Doctor is not in Phase 2 pending state" };
  }

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: { approvalStatus: DoctorApprovalStatus.PHASE2_APPROVED, phase2RejectionReason: null },
  });

  return { message: "Phase 2 approved. Doctor is fully verified. Toggle appointments to allow bookings." };
};

/** Reject Phase 2 — doctor can re-submit their professional details */
export const rejectPhase2 = async (doctorId: string, reason: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: {
      approvalStatus: DoctorApprovalStatus.PHASE2_REJECTED,
      phase2RejectionReason: reason || null,
    },
  });

  return { message: "Doctor Phase 2 details rejected. They can re-submit their information." };
};

// ─────────────── PHASE 3 ───────────────

/** Toggle whether a doctor can accept appointment bookings (Phase 3 gate) */
export const toggleAppointments = async (doctorId: string, canTake: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const profile = await prisma.doctorProfile.findUnique({ where: { userId: doctorId } });
  if (!profile) throw { status: 404, message: "Doctor profile not found" };
  if (profile.approvalStatus !== DoctorApprovalStatus.PHASE2_APPROVED) {
    throw { status: 400, message: "Doctor must be Phase 2 approved before toggling appointments" };
  }

  // If disabling, block if there are active calls
  if (!canTake) {
    const activeCalls = await prisma.appointment.count({
      where: { doctorId, callStatus: "IN_PROGRESS" },
    });
    if (activeCalls > 0) {
      throw { status: 409, message: "Cannot disable appointments: Doctor is currently in an active video consultation." };
    }
  }

  await prisma.doctorProfile.update({
    where: { userId: doctorId },
    data: { canTakeAppointments: canTake },
  });

  return {
    message: canTake
      ? "Appointments enabled. Doctor can now receive bookings."
      : "Appointments disabled. Doctor will not receive new bookings.",
  };
};

// ─────────────── ACTIVATE / DEACTIVATE (account ban) ───────────────

/** Deactivate a doctor account (blocks login entirely) */
export const deactivateDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  const activeCalls = await prisma.appointment.count({
    where: { doctorId, callStatus: "IN_PROGRESS" },
  });
  if (activeCalls > 0) {
    throw { status: 409, message: "Cannot deactivate: Doctor is currently in an active video consultation." };
  }

  const scheduledAppointments = await prisma.appointment.count({
    where: { doctorId, status: "CONFIRMED" },
  });
  if (scheduledAppointments > 0) {
    throw {
      status: 409,
      message: `Cannot deactivate: ${scheduledAppointments} appointment(s) are scheduled. Cancel or complete them first.`,
    };
  }

  await prisma.user.update({ where: { id: doctorId }, data: { isActive: false } });
  return { message: "Doctor deactivated. They can no longer log in." };
};

/** Re-activate a previously deactivated doctor account */
export const activateDoctor = async (doctorId: string) => {
  const user = await prisma.user.findUnique({ where: { id: doctorId, role: "DOCTOR" } });
  if (!user) throw { status: 404, message: "Doctor not found" };

  await prisma.user.update({ where: { id: doctorId }, data: { isActive: true } });
  return { message: "Doctor account reactivated successfully." };
};

// ─────────────── PATIENTS ───────────────

/** All patients (with pagination and search) */
export const getAllPatients = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search ?? "";

  const where: any = { role: "PATIENT" };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, patients] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        patientProfile: {
          select: { phone: true, dateOfBirth: true, gender: true, bloodGroup: true },
        },
        _count: { select: { patientAppointments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/** All appointments with full relations (admin view, with pagination, search, filters) */
export const getAllAppointments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const status = params?.status ?? "";
  const search = params?.search ?? "";
  const dateFrom = params?.dateFrom ?? "";
  const dateTo = params?.dateTo ?? "";

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.timeSlot = {};
    if (dateFrom) {
      where.timeSlot.date = { gte: dateFrom };
    }
    if (dateTo) {
      where.timeSlot.date = { ...where.timeSlot.date, lte: dateTo };
    }
  }

  if (search) {
    where.OR = [
      { doctor: { name: { contains: search, mode: "insensitive" } } },
      { patient: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        timeSlot: true,
        doctor: { select: { id: true, name: true, email: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/** Cancel any appointment (admin override) */
export const cancelAppointment = async (appointmentId: string) => {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt) throw { status: 404, message: "Appointment not found" };
  if (appt.status !== "CONFIRMED") throw { status: 400, message: "Only CONFIRMED appointments can be cancelled" };

  return prisma.$transaction([
    prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } }),
    prisma.timeSlot.update({ where: { id: appt.timeSlotId }, data: { isBooked: false } }),
  ]);
};

/** Get analytics report for a specific period */
export const getAnalytics = async (period: string) => {
  const now = new Date();
  const startDate = new Date();

  if (period === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "90d") {
    startDate.setDate(now.getDate() - 90);
  } else if (period === "12m") {
    startDate.setMonth(now.getMonth() - 12);
  } else {
    // default 30d
    startDate.setDate(now.getDate() - 30);
  }

  // Fetch relevant tables in parallel
  const [appointments, users, topDoctorsRes, specDistributionRes] = await Promise.all([
    prisma.appointment.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true, amount: true, paymentStatus: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["DOCTOR", "PATIENT"] }, createdAt: { gte: startDate } },
      select: { createdAt: true, role: true },
    }),
    prisma.appointment.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: startDate } },
      select: {
        amount: true,
        doctor: {
          select: {
            id: true,
            name: true,
            doctorProfile: { select: { specializations: true } },
          },
        },
      },
    }),
    prisma.doctorProfile.findMany({
      select: { specializations: true },
    }),
  ]);

  // Aggregate daily records in memory (DB independent, high performance)
  const formatDayKey = (date: Date): string => date.toISOString().slice(0, 10);

  const revenueMap: Record<string, number> = {};
  const registrationsMap: Record<string, { doctors: number; patients: number }> = {};
  const appointmentsMap: Record<string, { confirmed: number; completed: number; cancelled: number }> = {};

  // Initialize all days in the range to ensure zero-filled graphs
  const iterDate = new Date(startDate);
  while (iterDate <= now) {
    const key = formatDayKey(iterDate);
    revenueMap[key] = 0;
    registrationsMap[key] = { doctors: 0, patients: 0 };
    appointmentsMap[key] = { confirmed: 0, completed: 0, cancelled: 0 };
    iterDate.setDate(iterDate.getDate() + 1);
  }

  // Populate Revenue points
  appointments.forEach((appt) => {
    if (appt.paymentStatus === "PAID") {
      const key = formatDayKey(appt.createdAt);
      if (revenueMap[key] !== undefined) {
        revenueMap[key] += appt.amount;
      }
    }
  });

  // Populate Registrations points
  users.forEach((u) => {
    const key = formatDayKey(u.createdAt);
    if (registrationsMap[key] !== undefined) {
      if (u.role === "DOCTOR") {
        registrationsMap[key].doctors++;
      } else {
        registrationsMap[key].patients++;
      }
    }
  });

  // Populate Appointments points
  appointments.forEach((appt) => {
    const key = formatDayKey(appt.createdAt);
    if (appointmentsMap[key] !== undefined) {
      if (appt.status === "COMPLETED") {
        appointmentsMap[key].completed++;
      } else if (appt.status === "CANCELLED") {
        appointmentsMap[key].cancelled++;
      } else {
        appointmentsMap[key].confirmed++;
      }
    }
  });

  // Format maps to sorted arrays
  const revenueByDay = Object.entries(revenueMap).map(([date, amount]) => ({ date, amount }));
  const registrationsByDay = Object.entries(registrationsMap).map(([date, counts]) => ({
    date,
    doctors: counts.doctors,
    patients: counts.patients,
  }));
  const appointmentsByDay = Object.entries(appointmentsMap).map(([date, counts]) => ({
    date,
    confirmed: counts.confirmed,
    completed: counts.completed,
    cancelled: counts.cancelled,
  }));

  // Aggregate top doctors
  const doctorsPerf: Record<string, { id: string; name: string; revenue: number; appointments: number; specializations: string[] }> = {};
  topDoctorsRes.forEach((appt) => {
    const docId = appt.doctor.id;
    if (!doctorsPerf[docId]) {
      doctorsPerf[docId] = {
        id: docId,
        name: appt.doctor.name,
        revenue: 0,
        appointments: 0,
        specializations: appt.doctor.doctorProfile?.specializations ?? [],
      };
    }
    doctorsPerf[docId].revenue += appt.amount;
    doctorsPerf[docId].appointments++;
  });
  const topDoctors = Object.values(doctorsPerf)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Aggregate specializations
  const specPerf: Record<string, number> = {};
  specDistributionRes.forEach((profile) => {
    profile.specializations.forEach((spec) => {
      specPerf[spec] = (specPerf[spec] ?? 0) + 1;
    });
  });
  const specializationDistribution = Object.entries(specPerf)
    .map(([specialization, count]) => ({ specialization, count }))
    .sort((a, b) => b.count - a.count);

  // Summary Metrics
  const completedApptsCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const activeApptsCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const totalCount = completedApptsCount + activeApptsCount;
  const completionRate = totalCount > 0 ? (completedApptsCount / totalCount) * 100 : 0;

  const paidAppts = appointments.filter((a) => a.paymentStatus === "PAID");
  const totalPaidRevenue = paidAppts.reduce((sum, a) => sum + a.amount, 0);
  const avgRevenuePerAppointment = paidAppts.length > 0 ? totalPaidRevenue / paidAppts.length : 0;

  return {
    revenueByDay,
    registrationsByDay,
    appointmentsByDay,
    topDoctors,
    specializationDistribution,
    completionRate,
    avgRevenuePerAppointment,
  };
};
