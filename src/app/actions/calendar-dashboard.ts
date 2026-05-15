"use server";

import { revalidatePath } from "next/cache";
import {
  addProductFromAdmin,
  addWaitlistEntryFromAdmin,
  removeWaitlistEntryFromAdmin,
} from "@/lib/calendar-dashboard";

export async function addWaitlistAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const result = await addWaitlistEntryFromAdmin(clientId, serviceId);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function removeWaitlistAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await removeWaitlistEntryFromAdmin(id);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function addProductAction(formData: FormData) {
  const priceRaw = String(formData.get("price") ?? "").trim();
  const result = await addProductFromAdmin({
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    price: priceRaw ? Number(priceRaw) : undefined,
    imageUrl: String(formData.get("imageUrl") ?? ""),
    stationTag: String(formData.get("stationTag") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}
