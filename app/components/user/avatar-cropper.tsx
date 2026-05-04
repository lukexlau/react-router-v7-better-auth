import { ImageUpIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { CardFooter } from "~/components/ui/card";
import {
	Cropper,
	CropperCropArea,
	CropperDescription,
	CropperImage,
} from "~/components/ui/cropper";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Slider } from "~/components/ui/slider";
import { Spinner } from "~/components/ui/spinner";
import { useFileUpload } from "~/hooks/use-file-upload";
import {
	ACCEPTED_IMAGE_TYPES,
	MAX_FILE_SIZE,
} from "~/lib/validations/settings";

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.setAttribute("crossOrigin", "anonymous"); // Needed for canvas Tainted check
		image.src = url;
	});

async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area,
	outputWidth: number = pixelCrop.width, // Optional: specify output size
	outputHeight: number = pixelCrop.height,
): Promise<Blob | null> {
	try {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			return null;
		}

		// Set canvas size to desired output size
		canvas.width = outputWidth;
		canvas.height = outputHeight;

		// Draw the cropped image onto the canvas
		ctx.drawImage(
			image,
			pixelCrop.x,
			pixelCrop.y,
			pixelCrop.width,
			pixelCrop.height,
			0,
			0,
			outputWidth, // Draw onto the output size
			outputHeight,
		);

		// Convert canvas to blob
		return new Promise((resolve) => {
			canvas.toBlob((blob) => {
				resolve(blob);
			}, "image/jpeg"); // Specify format and quality if needed
		});
	} catch (error) {
		console.error("Error in getCroppedImg:", error);
		return null;
	}
}

export default function AvatarCropper({
	avatarUrl,
}: {
	avatarUrl: string | null;
}) {
	const [
		{ files, isDragging, errors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			getInputProps,
		},
	] = useFileUpload({
		accept: ACCEPTED_IMAGE_TYPES.join(","),
		maxSize: MAX_FILE_SIZE,
	});

	const previewUrl = files[0]?.preview || null;
	const fileId = files[0]?.id;

	const [finalImageUrl, setFinalImageUrl] = useState<string | null>(avatarUrl);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Ref to track the previous file ID to detect new uploads
	const previousFileIdRef = useRef<string | undefined | null>(null);

	// State to store the desired crop area in pixels
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

	// State for zoom level
	const [zoom, setZoom] = useState(1);

	// Fetcher for uploading the cropped image
	const fetcher = useFetcher();
	const isUploading = fetcher.state !== "idle";

	// Callback for Cropper to provide crop data - Wrap with useCallback
	const handleCropChange = useCallback((pixels: Area | null) => {
		setCroppedAreaPixels(pixels);
	}, []);

	const handleApply = async () => {
		// Check if we have the necessary data
		if (!previewUrl || !fileId || !croppedAreaPixels) {
			console.error("Missing data for apply:", {
				previewUrl,
				fileId,
				croppedAreaPixels,
			});
			// Remove file if apply is clicked without crop data?
			if (fileId) {
				removeFile(fileId);
				setCroppedAreaPixels(null);
			}
			return;
		}

		try {
			// 1. Get the cropped image blob using the helper
			const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);

			if (!croppedBlob) {
				throw new Error("Failed to generate cropped image blob.");
			}

			// 2. Create a NEW object URL from the cropped blob
			const newFinalUrl = URL.createObjectURL(croppedBlob);

			// 3. Revoke the OLD finalImageUrl if it exists
			if (finalImageUrl) {
				URL.revokeObjectURL(finalImageUrl);
			}

			// 4. Set the final avatar state to the NEW URL
			setFinalImageUrl(newFinalUrl);

			// 5. Create a FormData object and add the cropped image
			const formData = new FormData();
			formData.append("image", croppedBlob, `avatar-${Date.now()}.jpg`);
			formData.append("intent", "set-avatar");

			// 6. Submit the cropped image to the backend
			fetcher.submit(formData, {
				method: "post",
				action: "/settings/account",
				encType: "multipart/form-data",
			});

			// 7. Close the dialog
			setIsDialogOpen(false);
		} catch (error) {
			console.error("Error during apply:", error);
			// Close the dialog even if cropping fails
			setIsDialogOpen(false);
		}
	};

	const handleRemoveFinalImage = () => {
		if (finalImageUrl?.startsWith("blob:")) {
			URL.revokeObjectURL(finalImageUrl);
		}
		setFinalImageUrl(null);
		fetcher.submit({ intent: "delete-avatar" }, { method: "post" });
	};

	useEffect(() => {
		const currentFinalUrl = finalImageUrl;
		// Cleanup function
		return () => {
			if (currentFinalUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(currentFinalUrl);
			}
		};
	}, [finalImageUrl]);

	// Effect to open dialog when a *new* file is ready
	useEffect(() => {
		// Check if fileId exists and is different from the previous one
		if (fileId && fileId !== previousFileIdRef.current) {
			setIsDialogOpen(true); // Open dialog for the new file
			setCroppedAreaPixels(null); // Reset crop area for the new file
			setZoom(1); // Reset zoom for the new file
		}
		// Update the ref to the current fileId for the next render
		previousFileIdRef.current = fileId;
	}, [fileId]); // Depend only on fileId

	// Effect to show error toast if there are any
	useEffect(() => {
		if (errors.length > 0) {
			toast.error(errors[0]);
		}
	}, [errors]);

	return (
		<div className="flex flex-col items-center gap-2">
			<div className="relative inline-flex">
				{/* Drop area - uses finalImageUrl */}
				<button
					type="button"
					className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-[img]:border-none has-disabled:opacity-50 data-[dragging=true]:bg-accent/50"
					onClick={openFileDialog}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					data-dragging={isDragging || undefined}
					aria-label={finalImageUrl ? "Change image" : "Upload image"}
					disabled={isUploading}
				>
					{finalImageUrl ? (
						<img
							className="size-full object-cover"
							src={finalImageUrl}
							alt="User avatar"
							width={64}
							height={64}
							style={{ objectFit: "cover" }}
						/>
					) : (
						<span>
							<ImageUpIcon className="size-6 opacity-60" />
						</span>
					)}
					{isUploading && (
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md">
								<Spinner className="size-4" />
							</span>
						</div>
					)}
				</button>
				{/* Remove button - only show if we have a user uploaded avatar */}
				{finalImageUrl && (
					<Button
						onClick={handleRemoveFinalImage}
						size="icon"
						className="absolute -top-0.5 -right-0.5 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
						aria-label="Remove image"
						disabled={isUploading}
					>
						<XIcon className="size-3.5" />
					</Button>
				)}
				<input
					{...getInputProps()}
					name="image"
					className="sr-only"
					aria-label="Upload image file"
					tabIndex={-1}
				/>
			</div>

			{/* Cropper Dialog - Use isDialogOpen for open prop */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-140 *:[button]:hidden">
					<DialogHeader>
						<DialogTitle className="sr-only">Avatar cropper</DialogTitle>
						<DialogDescription className="sr-only">
							Avatar cropper dialog
						</DialogDescription>
					</DialogHeader>
					{previewUrl && (
						<Cropper
							className="h-96 sm:h-120"
							image={previewUrl}
							zoom={zoom}
							onCropChange={handleCropChange}
							onZoomChange={setZoom}
						>
							<CropperDescription />
							<CropperImage />
							<CropperCropArea className="rounded-full" />
						</Cropper>
					)}

					{/* Zoom controls */}
					<div className="mx-auto flex w-full max-w-80 items-center gap-4 py-3">
						<ZoomOutIcon
							className="shrink-0 opacity-60"
							size={16}
							aria-hidden="true"
						/>
						<Slider
							defaultValue={[1]}
							value={[zoom]}
							min={1}
							max={3}
							step={0.1}
							onValueChange={(values) => {
								if (values[0] !== undefined) {
									setZoom(values[0]);
								}
							}}
							aria-label="Zoom slider"
						/>
						<ZoomInIcon
							className="shrink-0 opacity-60"
							size={16}
							aria-hidden="true"
						/>
					</div>

					{/* Match CardFooter: full-bleed bar with border-t, no DialogFooter -mx margins (parent uses p-0). */}
					<CardFooter className="justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							aria-label="Cancel"
							onClick={() => setIsDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							aria-label="Set avatar"
							onClick={handleApply}
							disabled={!previewUrl}
							autoFocus
						>
							Set avatar
						</Button>
					</CardFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
