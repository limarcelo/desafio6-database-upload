import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import path from 'path';
import AppError from '../errors/AppError';
import loadCSV from '../config/LoadCSV';

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {

    const transactions: Transaction[] = [];

    const csvFilePath = path.resolve(__dirname, '../files', 'import_template.csv');

    const data = await loadCSV(csvFilePath);

    if (!data) {
      throw new AppError('No data to import.', 400);
    }
    const createTransactionService = new CreateTransactionService();
    const transactionsRespository = new TransactionsRepository();

    for (const currentData of data) {
      const transaction = await createTransactionService.execute({
        title: currentData[0],
        type: currentData[1] == 'income' ? 'income' : 'outcome',
        value: parseFloat(currentData[2]),
        category: currentData[3],
      });

      transactionsRespository.save(transaction);
      transactions.push(transaction);
    }
    return transactions;
  }
}


export default ImportTransactionsService;






