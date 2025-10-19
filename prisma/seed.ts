import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  console.log(`seed ${permissionsData.length} permission`);

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

  console.log(` Admin & User roles created`);

  const allPermissions = await prisma.permission.findMany();

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

  console.log(`Permissions assigned to roles`);
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
