import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}


@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions
      .filter(transaction => transaction.type == 'income')
      .reduce((acc, transaction) => {
        return acc += parseInt(transaction.value.toString()) ;
      }, 0);

    const outcome = transactions
      .filter(transaction => transaction.type == 'outcome')
      .reduce((acc, transaction) => {
        return acc +=  parseInt(transaction.value.toString()) ;;
      }, 0);

    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }

  public async removeAll(): Promise<void>{
    this.query('delete from transactions');
    console.log('Delete complete!');
  }


}

export default TransactionsRepository;
