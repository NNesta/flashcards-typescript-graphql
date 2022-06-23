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
            resolve(parent, _, ctx) {
                console.log(ctx);
                return ctx.prisma.category
                    .findUnique({ where: { id: parent.id } })
                    .categoryCreator();
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
        t.nonNull.int('count');
        t.id('id');
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
                let count;
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
                    count = await ctx.prisma.category.count({ where: { isActive } });
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

                    count = await ctx.prisma.category.count({ where });
                }
                const id = JSON.stringify(args);

                return {
                    categories,
                    count,
                    id,
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
                console.log(userId)

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
                console.log(newCategory)

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
