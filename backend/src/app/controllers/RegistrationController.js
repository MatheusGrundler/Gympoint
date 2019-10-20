import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Registration from '../models/Registration';
import Plan from '../models/Plan';

class RegistrationContoller {
  async index(req, res) {
    const registrations = await Registration.findAll();

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'No registrations found' });
    }

    return res.json(registrations);
  }

  async store(req, res) {
    /**
     * Lógica
     *
     * Validar dados de entrada, -OK
     * Pega student_id,plan_id,start_date da requisição, OK
     * pegar duração(duration) do plano selecionado(plan_id) OK
     * Calcular data final ou seja, pegar a data de inicio(start_date) e adicionar a duração do plano selecionado(start_date + duration) OK
     * Calcular o preço multiplicando o preço(price) pela duração do plano(duration)
     *
     *
     * INFOS
     *
     * start_date deve ser passado no padrão: 2019-10-18 ou 2019-10-18T09:00:00-03:00
     */

    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /** Dados do Plano */
    const { duration, price } = await Plan.findByPk(plan_id);

    /** Dados do Registro */
    const end_date = addMonths(parseISO(start_date), duration);
    const final_price = price * duration;
    // formated date
    const fstart_date = parseISO(start_date);

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date: fstart_date,
      end_date,
      price: final_price,
    });

    return res.json(registration);
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}
export default new RegistrationContoller();
