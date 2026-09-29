import mongoose from "mongoose";

import { NotFoundError, ValidationError } from "@/lib/errors";
import { buildPaginationMeta, PaginationInterface } from "@/lib/utils/pagination";
import { searchFilter } from "@/lib/utils/search";

import { InquiryStatus, INQUIRY_STATUSES } from "./inquirySchema";
import { IInquiryDocument, InquiryModel } from "./inquiry.model";

const inquiryFilter = (id: string) =>
  mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };

export const getAllInquiries = async (
  { page, limit, skip }: PaginationInterface,
  search: string,
  status?: string,
) => {
  const userSearch = searchFilter<IInquiryDocument>(
    ["name", "phone", "email", "productName", "message"],
    search,
  );
  const query: mongoose.QueryFilter<IInquiryDocument> = {
    ...userSearch,
  };
  if (status) {
    if (!INQUIRY_STATUSES.includes(status as InquiryStatus)) {
      throw new ValidationError("Invalid inquiry status");
    }
    query.status = status as InquiryStatus;
  }
  const [inquiries, total] = await Promise.all([
    InquiryModel.find(query)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit),
    InquiryModel.countDocuments(query),
  ]);
  return {
    data: inquiries,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getInquiryById = async (id: string) => {
  return InquiryModel.findOne(inquiryFilter(id));
};

export const updateInquiryStatus = async (id: string, status: InquiryStatus) => {
  if (!INQUIRY_STATUSES.includes(status)) {
    throw new ValidationError("Invalid inquiry status");
  }
  const updatedInquiry = await InquiryModel.findOneAndUpdate(
    inquiryFilter(id),
    { status },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
  if (!updatedInquiry) {
    throw new NotFoundError("Inquiry");
  }
  return updatedInquiry;
};