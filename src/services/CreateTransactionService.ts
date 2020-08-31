import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}


class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type is invalid', 401);
    }

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient funds.', 400);
    }

    let findedCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findedCategory) {
      findedCategory = await categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(findedCategory);
      console.log('Creating Category');
    }

    const transactionFounded = await transactionsRepository.findOne({
      where: {
        title: title,
      },
    });

    if (transactionFounded) {
      return transactionFounded;
    }

    const transaction = await transactionsRepository.create({
      title,
      type,
      value,
      category: findedCategory,
    });

    const transactionSaved = await transactionsRepository.save(transaction);
    return transactionSaved;
  }
}

export default CreateTransactionService;
