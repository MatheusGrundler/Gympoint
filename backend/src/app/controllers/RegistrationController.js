import * as Yup from 'yup';
import { format, addMonths, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

class RegistrationContoller {
  /**
   * Listar dados
   */

  async index(req, res) {
    const registrations = await Registration.findAll();

    if (registrations.length === 0) {
      return res.status(400).json({ message: 'No registrations found' });
    }
    registrations.forEach(registration => {
      const { student_id, plan_id, start_date, end_date, price } = registration;

      return res.json({ student_id, plan_id, start_date, end_date, price });
    });
    return null;
  }
  /**
   * Criar dados
   */

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

    /** Dados do student */
    const student = await Student.findByPk(student_id, {
      attributes: ['nome', 'email'],
    });

    /** Dados do Plano */
    const plan = await Plan.findByPk(plan_id);

    /** Dados do Registro */
    const end_date = addMonths(parseISO(start_date), plan.duration);
    const final_price = plan.price * plan.duration;
    // formated date
    const fstart_date = parseISO(start_date);

    await Registration.create({
      student_id,
      plan_id,
      start_date: fstart_date,
      end_date,
      price: final_price,
    });

    await Mail.sendMail({
      to: `${student.nome} <${student.email}>`,
      subject: 'Matrícula realizada com sucesso',
      template: 'newRegistration',
      context: {
        student: student.nome,
        plan_title: plan.title,
        duration: plan.duration,
        price: final_price,
        start_date: format(fstart_date, " dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        end_date: format(end_date, " dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
      },
    });

    return res.json({
      student_id,
      plan_id,
      fstart_date,
      end_date,
      final_price,
    });
  }

  /**
   * Atualizar dados
   */

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.number(),
      end_date: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not find' });
    }

    const resgistrationExists = await Registration.findOne({
      where: { id: req.params.id },
    });

    if (!resgistrationExists) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    await registration.update(req.body);

    const { student_id, plan_id, start_date, end_date, price } = registration;

    return res.json({ student_id, plan_id, start_date, end_date, price });
  }

  /**
   * Excluir dados
   */

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: 'Registration not find' });
    }

    await registration.destroy();

    return res.json({ success: 'Registration has been deleted' });
  }
}
export default new RegistrationContoller();
