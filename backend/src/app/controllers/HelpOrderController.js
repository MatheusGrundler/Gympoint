import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class HelpOrderController {
  async index(req, res) {
    /**
     * List help-orders not aswered (only admin)
     */
    if (req.headers.authorization) {
      const helpOrders = await HelpOrder.findAll({
        where: {
          answer: null,
        },
      });
      if (!helpOrders || helpOrders.length === 0) {
        res.status(400).json({ message: 'No help orders registred' });
      }

      return res.json(helpOrders);
    }
    /**
     * List all help-orders  for student
     */

    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id: req.params.student_id,
      },
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { student_id } = req.params;

    const studentExist = await Student.findByPk(student_id);

    if (!studentExist) {
      return res
        .status(400)
        .json({ message: `student id: ${student_id}, does not exists` });
    }

    const { question } = await HelpOrder.create({
      student_id,
      question: req.body.question,
    });

    return res.json({ student_id, question });
  }

  /**
   *
   * Atualizar Help order
   *
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (req.userId !== 1) {
      return res.status(400).json({ error: 'Only Admin can ansew a question' });
    }

    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      attributes: ['question'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['nome', 'email'],
        },
      ],
    });

    await HelpOrder.update(
      {
        answer: req.body.answer,
        answer_at: new Date(),
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    await Mail.sendMail({
      to: `${helpOrder.student.nome} <${helpOrder.student.email}>`,
      subject: 'Sua pergunta foi respondida',
      template: 'newAnswer',
      context: {
        student: helpOrder.student.nome,
        question: helpOrder.question,
        answer: req.body.answer,
      },
    });

    return res.json({ answer: req.body.answer });
  }
}
export default new HelpOrderController();
