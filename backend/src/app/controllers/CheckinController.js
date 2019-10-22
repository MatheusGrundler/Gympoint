import * as Yup from 'yup';
import { format, subDays, parseISO } from 'date-fns';

import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  /**
   * Listar dados
   */

  async index(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id } = req.params;

    const stundentExists = await Student.findByPk(student_id);

    if (!stundentExists) {
      res.status(400).json({ erro: 'Student not find in Data Base' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id,
      },
    });

    return res.json(checkins);
  }

  /**
   * Criar dados
   */

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { student_id } = req.params;

    const stundentExists = await Student.findByPk(student_id);

    if (!stundentExists) {
      res.status(400).json({ erro: 'Student not find in Data Base' });
    }
    // Get the actual Date - 7 days
    const lastSeven = subDays(parseISO(format(new Date(), 'yyy-MM-dd')), 7);

    // get checkins between today and last seven days
    const checkins = await Checkin.findAll({
      where: {
        student_id,
        updated_at: {
          [Op.between]: [lastSeven, format(new Date(), 'yyy-MM-dd')],
        },
      },
    });

    if (checkins.length >= 5) {
      res.json({
        message:
          'You have reached the maximum of 5 checkins in the last 7 days ',
      });
    }

    const checkin = await Checkin.create({
      student_id,
    });

    return res.json({ checkin });
  }
}
export default new CheckinController();
