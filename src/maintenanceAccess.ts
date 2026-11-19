export async function verifyMaintenanceAdmin(
  expectedUserId: string | null,
  verifyUser: () => Promise<{ id: string } | null>,
  readRole: (userId: string) => Promise<string | null>,
): Promise<boolean> {
  if (!expectedUserId) return false;
  try {
    const verifiedUser = await verifyUser();
    if (!verifiedUser || verifiedUser.id !== expectedUserId) return false;
    return await readRole(verifiedUser.id) === "admin";
  } catch {
    return false;
  }
}
