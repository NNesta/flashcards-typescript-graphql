import { Prisma } from '@prisma/client';
import {
    arg,
    booleanArg,
    enumType,
    extendType,
    inputObjectType,
    intArg,
    list,
    nonNull,
    nullable,
    objectType,
    stringArg,
} from 'nexus';
export const Category = objectType({
    name: 'Category',
    definition(t) {
        
        t.nonNull.int('id');
        t.nonNull.string('name')
        t.nonNull.string('description')
        t.nonNull.string('createdAt');
        t.field('categoryCreator', {
            type: 'User',
            async resolve(parent, _, ctx) {
                const user = await ctx.prisma.category
                    .findUnique({ where: { id: parent.id } })
                    .categoryCreator();
                return user
            },
        });
    },
});

export const CategoryOrderByInput = inputObjectType({
    name: 'CategoryOrderByInput',
    definition(t) {
        t.field('name', { type: Sorting });
        t.field('createdAt', { type: Sorting });
    },
});

export const Sorting = enumType({
    name: 'Sorting',
    members: ['asc', 'desc'],
});

export const AllCategories = objectType({
    name: 'AllCategories',
    definition(t) {
        t.nonNull.list.field('categories', { type: Category });
    },
});

export const CategoryQuery = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.field('category', {
            type: 'Category',

            args: {
                index: intArg(),
            },
            async resolve(_, args, ctx) {
                let category;
                category = await ctx.prisma.category.findUnique(
                    {
                        where: {
                            id: args.index
                        }
                    }
                )
                return category;
            },
        });
        t.nonNull.field('categories', {
            type: 'AllCategories',

            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(CategoryOrderByInput)) }),
            },
            async resolve(_, args, ctx) {
                let categories;
                if (args.filter === 'true' || args.filter === 'false') {
                    const isActive = args.filter === 'true' ? true : false;

                    categories = await ctx.prisma.category.findMany({
                        where: { isActive },
                        skip: args.skip as number | undefined,
                        take: args.take as number | undefined,
                        orderBy: args?.orderBy as
                            | Prisma.Enumerable<Prisma.CategoryOrderByWithRelationInput>
                            | undefined,
                    });
                } else {
                    const where = args.filter
                        ? {
                            OR: [
                                { name: { contains: args.filter } },
                                { description: { contains: args.filter } },
                            ],
                        }
                        : {};
                    categories = await ctx.prisma.category.findMany({
                        where,
                        skip: args?.skip as number | undefined,
                        take: args?.take as number | undefined,
                        orderBy: args?.orderBy as
                            | Prisma.Enumerable<Prisma.CategoryOrderByWithRelationInput>
                            | undefined,
                    });

                }
                return {
                    categories,
                };
            },
        });
    },
});

export const CategoryMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('createCategory', {
            type: 'Category',
            args: {
                name: nonNull(stringArg()),
                description: nonNull(stringArg()),
            },

            resolve(_, args, ctx) {
                const { name, description, } = args;
                const { userId } = ctx;
                if (!userId) {
                    throw new Error('Please Log in');
                }
                const newCategory = ctx.prisma.category.create({
                    data: {
                        name,
                        description,
                        categoryCreator: { connect: { id: userId } },
                    },
                });
                return newCategory;
            },
        });

        t.nonNull.field('updateCategory', {
            type: 'Category',
            args: {
                name: nullable(stringArg()),
                isActive: nullable(booleanArg()),
                id: nonNull(intArg()),
            },

            resolve(_, args, ctx) {
                const { name, description, isActive, id } = args;
                const { userId } = ctx;

                if (!userId) {
                    throw new Error('Please Log in');
                }

                const newCategory = ctx.prisma.category.update({
                    where: { id },
                    data: {
                        ...(name && { name }),
                        ...(description && { description }),
                        ...(isActive != null && { isActive }),
                    },
                });

                return newCategory;
            },
        });

        t.nonNull.field('deleteCategory', {
            type: 'Category',
            args: {
                id: nonNull(intArg()),
            },

            resolve(_, args, ctx) {
                const { id } = args;
                const { userId } = ctx;

                if (!userId) {
                    throw new Error('Please Log in');
                }

                return ctx.prisma.category.delete({
                    where: { id },
                });
            },
        });
    },
});
