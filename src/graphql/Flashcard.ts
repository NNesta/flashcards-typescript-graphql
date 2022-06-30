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

export const Flashcard = objectType({
  name: 'Flashcard',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('question');
    t.nonNull.string('answer');
    t.nonNull.boolean('isReady');
    t.nonNull.string('createdAt')
    t.nonNull.string('updatedAt')
    t.field('flashCardCreator', {
      type: 'User',
      resolve(parent, _, ctx) {
        return ctx.prisma.flashcard
          .findUnique({ where: { id: parent.id } })
          .flashCardCreator();
      },
    });
    t.field('category', {
      type: 'Category',
      resolve(parent, _, ctx) {
        return ctx.prisma.flashcard
          .findUnique({ where: { id: parent.id } })
          .category();
      },
    });
  },
});

export const FlashcardOrderByInput = inputObjectType({
  name: 'FlashcardOrderByInput',
  definition(t) {
    t.field('question', { type: Sort });
    t.field('answer', { type: Sort });
    t.field('createdAt', { type: Sort });
  },
});

export const Sort = enumType({
  name: 'Sort',
  members: ['asc', 'desc'],
});

export const AllFlashcards = objectType({
  name: 'AllFlashcards',
  definition(t) {
    t.nonNull.list.field('flashcards', { type: Flashcard });
  },
});

export const FlashcardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('flashcard', {
      type: 'Flashcard',
      args: {
        index: intArg(),
      },
      async resolve(_, args, ctx) {
        let flashcard;
          flashcard = await ctx.prisma.flashcard.findUnique(
            {
              where: {
                id: args.index
              }
            }
          )
        return flashcard;
      },
    });
    t.nonNull.field('flashcards', {
      type: 'AllFlashcards',

      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(FlashcardOrderByInput)) }),
        category: intArg(),
      },
      async resolve(_, args, ctx) {
        let flashcards;
        if (args.filter === 'true' || args.filter === 'false') {
          const isReady = args.filter === 'true' ? true : false;

          flashcards = await ctx.prisma.flashcard.findMany({
            where: { isReady },
            skip: args.skip as number | undefined,
            take: args.take as number | undefined,
            orderBy: args.orderBy as
              | Prisma.Enumerable<Prisma.FlashcardOrderByWithRelationInput>
              | undefined,
          });
        }
          else if (args.category) {
            flashcards = await ctx.prisma.flashcard.findMany({
              where: { categoryId: args.category },
            });
          }
         else {
          const where = args.filter
            ? {
              OR: [
                { question: { contains: args.filter } },
                { answer: { contains: args.filter } },
              ],
            }
            : {};
          flashcards = await ctx.prisma.flashcard.findMany({
            where,
            skip: args?.skip as number | undefined,
            take: args?.take as number | undefined,
            orderBy: args?.orderBy as
              | Prisma.Enumerable<Prisma.FlashcardOrderByWithRelationInput>
              | undefined,
          });
        }
        return {flashcards};    
      },
    });
  },
});

export const FlashcardMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createFlashcard', {
      type: 'Flashcard' ,
      args: {
        question: nonNull(stringArg()),
        answer: nonNull(stringArg()),
        category: nonNull(stringArg()),
      },

      async resolve(_, args, ctx) {
        const { question, answer, category } = args;
        const { userId } = ctx;
        if (!userId) {
          throw new Error('Please Log in.');
        }
        const flashcardCategory = await ctx.prisma.category.findUnique({
          where: {
            name: category
          }
        })
        if (!flashcardCategory) {
          throw new Error('That Category does not exist');
        }
        const newFlashcard = ctx.prisma.flashcard.create({
          data: {
            question,
            answer,
            category: { connect: { id: flashcardCategory.id } },
            flashCardCreator: { connect: { id: userId } },
          },
        });

        return newFlashcard;
      },
    });

    t.nonNull.field('updateFlashcard', {
      type: Flashcard,
      args: {
        question: nullable(stringArg()),
        answer: nullable(stringArg()),
        category: nullable(stringArg()),
        isReady: nullable(booleanArg()),
        id: nonNull(intArg()),
      },

      async resolve(_, args, ctx) {
        const { question, answer, isReady, category, id } = args;
        const { userId } = ctx;
        let flashcardCategory;

        if (!userId) {
          throw new Error('Please Log in');
        }
        if (category)
        {
          flashcardCategory = await ctx.prisma.category.findUnique({
          where: {
            name: category
          }
        })
          if (!flashcardCategory) {
          throw new Error('That Category does not exist');
          }
        }
        const flashcard = await ctx.prisma.flashcard.findUnique({
          where: {
              id
          }
        }).flashCardCreator()
        if (!flashcard) {
          throw new Error('That Flashcard does not exist');
        }
        if (flashcard.id !== userId) {
          throw new Error('You are not authorized to update this flashcard');
        }


        const newFlashcard = ctx.prisma.flashcard.update({
          where: { id },
          data: {
            ...(question && { question }),
            ...(answer && { answer }),
            ...(category && { categoryId: flashcardCategory.id }),
            ...(isReady != null && { isReady }),
          },
        });

        return newFlashcard;
      },
    });

    t.nonNull.field('deleteFlashcard', {
      type: 'Flashcard',
      args: {
        id: nonNull(intArg()),
      },

      async resolve(_, args, ctx) {
        const { id } = args;
        const { userId } = ctx;

        if (!userId) {
          throw new Error('Please Log in');
        }
        const flashcard = await ctx.prisma.flashcard.findUnique({
          where: {
            id
          }
        }).flashCardCreator()
        if (!flashcard) {
          throw new Error('That Flashcard does not exist');
        }
        if (flashcard.id !== userId) {
          throw new Error('You are not authorized to update this flashcard');
        }
        return ctx.prisma.flashcard.delete({
          where: { id },
        });
      },
    });
  },
});
