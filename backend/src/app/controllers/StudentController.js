import * as Yup from 'yup';

import Student from '../models/Student';

class StudentsController {
  async index(req, res) {
    if (req.params !== null) {
      const student = await Student.findByPk(req.params);
      return res.json(student);
    } else {
    }
    const student = await Student.findAll();

    return res.json(student);
  }
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      idade: Yup.number(),
      peso: Yup.number(),
      altura: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const userExists = await Student.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, nome, email, idade, peso, altura } = await Student.create(
      req.body
    );

    return res.json({ id, nome, email, idade, peso, altura });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      nome: Yup.string(),
      email: Yup.string().email(),
      idade: Yup.number(),
      peso: Yup.number(),
      altura: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const userExists = await Student.findOne({
      where: {
        id: req.body.id,
      },
    });

    if (!userExists) {
      return res.status(400).json({ error: 'User not exists.' });
    }
    const student = await Student.findByPk(req.body.id);

    await student.update(req.body);

    const { id, nome, email, idade, peso, altura } = req.body;

    return res.json({ id, nome, email, idade, peso, altura });
  }
}

export default new StudentsController();
