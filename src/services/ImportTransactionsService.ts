import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';

import uploadConfig from '../config/upload'

interface Request {
  fileName: string;
}

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ fileName }: Request): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const transactionsList: TransactionCSV[] = [];
    const createTransactionService = new CreateTransactionService();
    const transactionsRepository = getCustomRepository(TransactionsRepository);


    const filePathToImport = path.join(uploadConfig.directory, fileName);
    const filePathExists = await fs.promises.stat(filePathToImport);
    if (filePathExists) {
      await fs.promises.unlink(filePathToImport);
    }

    const readCSVStream = fs.createReadStream(fileName);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);
    await parseCSV.on('data', ([title, type, value, category]) => {
      transactionsList.push({ title, value, type, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    if (!transactionsList) {
      throw new AppError('Error to import CSV file.', 400);
    }

    for (const currentData of transactionsList) {
      const transaction = await createTransactionService.execute({
        ...currentData,
      });

      const transactionFounded = await transactionsRepository.findOne(transaction.id);

      if (!transactionFounded) {
        await transactionsRepository.save(transaction);
        transactions.push(transaction);
      }

    }
    return transactions;
  }
}

export default ImportTransactionsService;






