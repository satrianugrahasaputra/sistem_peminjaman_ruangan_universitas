import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { signSessionToken, verifySessionToken } from "../lib/auth";

describe("Profil & Keamanan Akun - Logic & Business Rules", () => {
  let testUser: any;

  beforeAll(async () => {
    // Create a temporary user for profile test
    const hashedPassword = await bcrypt.hash("PasswordLama123", 10);
    testUser = await prisma.user.create({
      data: {
        name: "Dosen Penguji Profil",
        email: "dosen.profil.test@kampus.ac.id",
        password: hashedPassword,
        role: "DOSEN",
        nidn: "9988776655",
        phone: "081299998888",
      },
    });
  });

  afterAll(async () => {
    if (testUser) {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }
    await prisma.$disconnect();
  });

  it("Test Profile 1: Berhasil memverifikasi password lama sebelum mengizinkan ganti password baru", async () => {
    const isOldValid = await bcrypt.compare("PasswordLama123", testUser.password);
    expect(isOldValid).toBe(true);

    const isWrongValid = await bcrypt.compare("SalahPassword", testUser.password);
    expect(isWrongValid).toBe(false);
  });

  it("Test Profile 2: Berhasil mengubah data profil (nama, NIDN, nomor telepon)", async () => {
    const updated = await prisma.user.update({
      where: { id: testUser.id },
      data: {
        name: "Dr. Dosen Penguji Profil, M.Kom",
        nidn: "9988776699",
        phone: "081288887777",
      },
    });

    expect(updated.name).toBe("Dr. Dosen Penguji Profil, M.Kom");
    expect(updated.nidn).toBe("9988776699");
    expect(updated.phone).toBe("081288887777");
  });

  it("Test Profile 3: Berhasil mengganti password baru dan verifikasi enkripsi bcrypt", async () => {
    const newHashed = await bcrypt.hash("PasswordBaru456!", 10);
    await prisma.user.update({
      where: { id: testUser.id },
      data: { password: newHashed },
    });

    const refreshedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    const isOldStillValid = await bcrypt.compare("PasswordLama123", refreshedUser!.password);
    expect(isOldStillValid).toBe(false);

    const isNewValid = await bcrypt.compare("PasswordBaru456!", refreshedUser!.password);
    expect(isNewValid).toBe(true);
  });

  it("Test Profile 4: Token sesi baru berhasil ditandatangani dan diverifikasi dengan data terupdate", async () => {
    const payload = {
      userId: testUser.id,
      email: testUser.email,
      name: "Dr. Dosen Penguji Profil, M.Kom",
      role: "DOSEN" as const,
      nidn: "9988776699",
    };

    const token = await signSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.name).toBe("Dr. Dosen Penguji Profil, M.Kom");
    expect(verified?.nidn).toBe("9988776699");
  });
});
