import { EventoAgendaModel, type IEventoAgenda } from '@spd/db';
import type { CreateEventoDTO, UpdateEventoDTO } from '../../dto/EventoDTO';
import type { EventoRepository } from '../EventoRepository';

export class MongooseEventoRepository implements EventoRepository {
  async list(): Promise<IEventoAgenda[]> {
    return EventoAgendaModel.find()
      .populate('convenio')
      .sort({ dataInicio: 1 })
      .exec();
  }

  async findById(id: string): Promise<IEventoAgenda | null> {
    return EventoAgendaModel.findById(id)
      .populate('convenio')
      .exec();
  }

  async create(data: CreateEventoDTO): Promise<IEventoAgenda> {
    const evento = await EventoAgendaModel.create(data);
    return evento.populate('convenio');
  }

  async update(id: string, data: UpdateEventoDTO): Promise<IEventoAgenda> {
    const updated = await EventoAgendaModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate('convenio')
      .exec();
    
    if (!updated) {
      throw new Error('Evento não encontrado');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await EventoAgendaModel.findByIdAndDelete(id).exec();
  }
}

