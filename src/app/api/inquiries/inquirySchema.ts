import { z } from "zod";

export const INQUIRY_STATUSES = ["pending", "contacted", "completed"] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const UpdateInquiryStatusSchema = z.object({
  status: z.enum(INQUIRY_STATUSES, {
    message: "Invalid inquiry status",
  }),
});

export type UpdateInquiryStatusInput = z.infer<
  typeof UpdateInquiryStatusSchema
>;