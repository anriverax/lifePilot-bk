import { Body, Controller, Post } from "@nestjs/common";
import { CreatePersonUseCase } from "../../application/use-cases/create-person.use-case";
import { CreatePersonDto } from "../../application/dtos/create-person.dto";
import { PersonEntity } from "../../domain/entities/person.entity";

@Controller("persons")
export class PersonController {
  constructor(private readonly createPersonUseCase: CreatePersonUseCase) {}

  @Post()
  async create(@Body() dto: CreatePersonDto): Promise<PersonEntity> {
    return this.createPersonUseCase.execute(dto);
  }
}
