import { ImageValidationError } from "@/lib/errors";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; //5MB

export const validateImageFile = async (file: File, options?: { maxFileSize?: number }) => {
    const maxSize = options?.maxFileSize || MAX_FILE_SIZE;
    const allowedTypes =  ALLOWED_IMAGE_TYPES;

    if (file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
        throw new ImageValidationError(`File size exceeds the maximum allowed size of ${maxMB}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
        throw new ImageValidationError(`Invalid file type. Allowed types are ${allowedTypes.join(", ")}`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const decodedFileType = await fileTypeFromBuffer(buffer);

    if(!decodedFileType || !allowedTypes.includes(decodedFileType.mime)){
        throw new ImageValidationError(`Invalid file type. Allowed types are ${allowedTypes.join(", ")}`);
    }

    return {buffer,mimeType:decodedFileType.mime};
}
export default validateImageFile;