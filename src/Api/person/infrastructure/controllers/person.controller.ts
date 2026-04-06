import { Body, Controller, Get, Param, Post, ParseIntPipe } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreatePersonDto } from "../../application/dtos/create-person.dto";
import { PersonEntity } from "../../domain/entities/person.entity";
import { CreatePersonCommand } from "../../application/commands/create-person.command";
import { GetPersonByIdQuery } from "../../application/queries/get-person-by-id.query";
import { ListPersonsQuery } from "../../application/queries/list-persons.query";

@Controller("persons")
export class PersonController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Create a new person
   * Dispatches CreatePersonCommand to CQRS command bus
   */
  @Post()
  async create(@Body() dto: CreatePersonDto): Promise<{ id: number }> {
    const personId = await this.commandBus.execute(
      new CreatePersonCommand(
        dto.firstName,
        dto.lastName,
        dto.address,
        dto.gender,
        dto.phoneNumber,
        dto.districtId,
        dto.birthdate,
        0 // System user ID
      )
    );

    return { id: personId };
  }

  /**
   * Get person by ID
   * Dispatches GetPersonByIdQuery to CQRS query bus
   */
  @Get(":id")
  async getById(@Param("id", ParseIntPipe) id: number): Promise<PersonEntity | null> {
    return this.queryBus.query(new GetPersonByIdQuery(id));
  }

  /**
   * List all persons
   * Dispatches ListPersonsQuery to CQRS query bus
   */
  @Get()
  async list(): Promise<PersonEntity[]> {
    return this.queryBus.query(new ListPersonsQuery());
  }
}
