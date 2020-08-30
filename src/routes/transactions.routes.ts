import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {

  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({totalTransactions: transactions.length, transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();

  const transaction =  await createTransaction.execute({
    title,
    type,
    category,
    value,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {

  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  deleteTransactionService.execute({ id });

  return response.status(204).send();

});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});


export default transactionsRouter;

