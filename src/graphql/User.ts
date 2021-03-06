import { extendType, objectType, intArg, enumType, nonNull } from 'nexus';

export const Role = enumType({
  name: "Role",
  members: ['ADMIN', 'USER'],
})
export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.field('role', {type: "Role"});
    t.nonNull.list.nonNull.field('flashcards', {
      type: 'Flashcard',
      resolve(parent, _, context) {
        return context.prisma.user
          .findUnique({ where: { id: parent.id } })
          .flashcards();
      },
    });
    t.nonNull.list.nonNull.field('categories', {
      type: 'Category',
      resolve(parent, _, context) {
        return context.prisma.user
          .findUnique({ where: { id: parent.id } })
          .categories();
      },
    });
  },
});
export const AllUser = objectType({
  name: 'AllUser',
  definition(t) {
    t.nonNull.list.field("users", { type: User })
  }
})
export const userQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field('user', {
      type: 'User',

      args: {
        index: intArg(),
      },
      async resolve(_, args, ctx) {
        const { role, userId } = ctx;
        if (role !== "ADMIN" || args.index !== userId) {
          throw new Error("Only admin can see other user")
        }
        const user = await ctx.prisma.user.findUnique(
          {
            where: {
              id: args.index
            }
          }
        )
        return user;
      },
    });
    t.nonNull.field('users', {
      type: "AllUser",
      async resolve(_parent, _args, ctx) {
        const { role } = ctx;
        if (role !== "ADMIN") {
          throw new Error("Only Admin can see all users")
        }
        const users = await ctx.prisma.user.findMany();
        return {users}
      }

    })
      ;
  }
})
export const userMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field('assignRole', {
      type: 'User',
      args: {
        index: nonNull(intArg()),
        role: nonNull(Role),
      },
      async resolve(_, args, ctx) {
        const { role } = ctx;
        if (role !== "ADMIN") {
          throw new Error("Only admin can assign role")
        }
        const user = await ctx.prisma.user.update(
          {
            where: {
              id: args.index,
            },
            data: {
              role: args.role,
            }
          }
        )
        return user;
      },
    });
  }
})
