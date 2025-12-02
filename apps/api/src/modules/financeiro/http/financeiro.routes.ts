import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';

const controller = new FinanceiroController();

export const financeiroRoutes = Router({ mergeParams: true });

financeiroRoutes.get('/', controller.show.bind(controller));
financeiroRoutes.put('/', controller.upsert.bind(controller));
financeiroRoutes.delete('/:id', controller.remove.bind(controller));

