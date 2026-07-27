"use server";

import { revalidatePath } from "next/cache";
import {
  addProductFromAdmin,
  addServiceFromAdmin,
  addStaffFromAdmin,
  deleteProductFromAdmin,
  deleteServiceFromAdmin,
  deleteStaffFromAdmin,
  updateProductFromAdmin,
  updateServiceFromAdmin,
  updateStaffFromAdmin,
} from "@/lib/catalog-admin";
import {
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

function parsePrice(raw: FormDataEntryValue | null): number | undefined {
  const text = String(raw ?? "").trim();
  if (!text) return undefined;
  const n = Number(text);
  return Number.isNaN(n) ? undefined : n;
}

export async function addProductAction(formData: FormData) {
  const result = await addProductFromAdmin({
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    price: parsePrice(formData.get("price")),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    stationTag: String(formData.get("stationTag") ?? ""),
    color: String(formData.get("color") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}

export async function updateProductAction(formData: FormData) {
  const result = await updateProductFromAdmin({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    price: parsePrice(formData.get("price")),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    stationTag: String(formData.get("stationTag") ?? ""),
    color: String(formData.get("color") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}

export async function deleteProductAction(id: string) {
  const result = await deleteProductFromAdmin(id);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function addServiceAction(formData: FormData) {
  const result = await addServiceFromAdmin({
    name: String(formData.get("name") ?? ""),
    price: parsePrice(formData.get("price")),
    image: String(formData.get("image") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}

export async function updateServiceAction(formData: FormData) {
  const result = await updateServiceFromAdmin({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    price: parsePrice(formData.get("price")),
    image: String(formData.get("image") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}

export async function deleteServiceAction(id: string) {
  const result = await deleteServiceFromAdmin(id);
  if (result.ok) revalidatePath("/");
  return result;
}

export async function addStaffAction(formData: FormData) {
  const result = await addStaffFromAdmin({
    name: String(formData.get("name") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}

export async function updateStaffAction(formData: FormData) {
  const result = await updateStaffFromAdmin({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (result.ok) revalidatePath("/");
  return result;
}

export async function deleteStaffAction(id: string) {
  const result = await deleteStaffFromAdmin(id);
  if (result.ok) revalidatePath("/");
  return result;
}
