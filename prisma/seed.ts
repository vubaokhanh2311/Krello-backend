import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ----- PERMISSIONS -----
  const permissionsData = [
    { code: 'user.view', name: 'Xem người dùng' },
    { code: 'user.create', name: 'Tạo người dùng' },
    { code: 'user.update', name: 'Cập nhật người dùng' },
    { code: 'user.delete', name: 'Xóa người dùng' },
  ];

  const permissions = await prisma.permission.createMany({
    data: permissionsData,
    skipDuplicates: true,
  });

  console.log(`✅ Đã seed ${permissionsData.length} quyền`);

  // ----- ROLES -----
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' },
  });

  console.log(`✅ Đã tạo vai trò Admin & User`);

  // ----- GÁN QUYỀN -----
  const allPermissions = await prisma.permission.findMany();

  // Gán tất cả quyền cho Admin
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Gán quyền user.view cho User
  const viewPermission = allPermissions.find((p) => p.code === 'user.view');
  if (viewPermission) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: viewPermission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: viewPermission.id,
      },
    });
  }

  console.log(`✅ Đã gán quyền cho các vai trò`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seed hoàn tất!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
