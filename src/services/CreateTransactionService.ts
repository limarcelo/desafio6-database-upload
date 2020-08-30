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

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type is invalid', 401);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient funds.', 400);
    }

    const categoriesRepository = getRepository(Category);

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

    const transaction = await transactionsRepository.create({
      title,
      type,
      value,
      category: findedCategory,
    });

    transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
