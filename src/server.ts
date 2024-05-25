import { PrismaClient, User } from '@prisma/client'
import fastify from 'fastify'
import { z } from 'zod'

const app = fastify()

const prisma = new PrismaClient()

interface UserParams {
  name: string;
  email: string;
}

//READ
app.get('/users', async () => {
  try {
    const users = await prisma.user.findMany();
    return { users };
  } catch (error) {
    console.error('Error when searching for users: ', error);
    return { message: 'Internal server error' };
  }
});


//CREATE
app.post('/users', async (request, reply) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  });

  try {
    const { name, email } = createUserSchema.parse(request.body);
    await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    return reply.status(201).send();
  } catch (error) {
    console.error('Error when creating user: ', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
});


//UPDATE
app.put('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { name, email } = request.body as UserParams;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      return reply.status(404).send({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { name, email },
    });

    return reply.status(200).send(updatedUser);
  } catch (error) {
    console.error('Error when updating user: ', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
});

//DELETE
app.delete('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      return reply.status(404).send({ message: 'User not found' });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: id },
    });

    return reply.status(200).send(deletedUser);
  } catch (error) {
    console.error('Error when deleting user: ', error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
});


app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
  console.log('HTTP Server Running')
})