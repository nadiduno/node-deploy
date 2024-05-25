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
  const users = await prisma.user.findMany()

  return { users }
})


//CREATE
app.post('/users', async (request, reply) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
  })

  const { name, email } = createUserSchema.parse(request.body)

  await prisma.user.create({
    data: {
      name,
      email,
    }
  })

  return reply.status(201).send()
})



//UPDATE
app.put('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { name, email } = request.body as UserParams;

  const updatedUser = await prisma.user.update({
    where: { id: id }, 
    data: { name, email },
  });

  return reply.status(200).send(updatedUser);
});

//DELETE
app.delete('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  const deletedUser = await prisma.user.delete({
    where: { id: id }, 
  });

  return reply.status(200).send(deletedUser);
});


app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
  console.log('HTTP Server Running')
})