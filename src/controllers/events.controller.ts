import { Request, Response } from 'express';
import { dataSource } from '../dataSource';
import { Event } from '../models/events.model';
import { ObjectId } from 'mongodb';

export class EventController {
  private eventRepository = dataSource.getMongoRepository(Event);

  // Update event statuses based on current date
  private async updateEventStatuses() {
    const events = await this.eventRepository.find();
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    for (const event of events) {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      
      let newStatus = event.status;

      if (eventDate < now && event.status === 'upcoming') {
        newStatus = 'completed';
      } else if (eventDate.getTime() === now.getTime() && event.status === 'upcoming') {
        newStatus = 'ongoing';
      }

      if (newStatus !== event.status) {
        await this.eventRepository.update(event._id, { 
          status: newStatus,
          updatedAt: new Date()
        });
      }
    }
  }

  // GET /api/admin/events
  getAllEvents = async (req: Request, res: Response) => {
    try {
      await this.updateEventStatuses();

      const { 
        status, 
        department,
        page = 1, 
        limit = 10, 
        sortBy = 'eventDate', 
        sortOrder = 'asc' 
      } = req.query;

      const query: any = {};
      if (status && ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status as string)) {
        query.status = status;
      }
      
      // Filter by department if provided
      if (department) {
        query.departmentId = department;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const [events, total] = await Promise.all([
        this.eventRepository.find({
          where: query,
          skip,
          take: Number(limit),
          order: sortOptions
        }),
        this.eventRepository.count(query)
      ]);

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            limit: Number(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/admin/events/department/:department
  getEventsByDepartment = async (req: Request, res: Response) => {
    try {
      await this.updateEventStatuses();
      
      const { department } = req.params;
      const { 
        status, 
        page = 1, 
        limit = 10, 
        sortBy = 'eventDate', 
        sortOrder = 'asc' 
      } = req.query;

      const query: any = { departmentId: department };
      if (status && ['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status as string)) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const [events, total] = await Promise.all([
        this.eventRepository.find({
          where: query,
          skip,
          take: Number(limit),
          order: sortOptions
        }),
        this.eventRepository.count(query)
      ]);

      res.status(200).json({
        success: true,
        data: {
          events,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            limit: Number(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events by department',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/admin/events/:id
  getEventById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const event = await this.eventRepository.findOne({
        where: { _id: new ObjectId(id) } as any
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Check if status needs updating
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      let updatedStatus = event.status;
      if (eventDate < now && event.status === 'upcoming') {
        updatedStatus = 'completed';
        await this.eventRepository.update(event._id, { 
          status: updatedStatus,
          updatedAt: new Date()
        });
        event.status = updatedStatus;
      }

      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /api/admin/events
  createEvent = async (req: Request, res: Response) => {
    try {
   
      const { title, description, venue, eventDate } = req.body;

      const event = new Event();
      event.title = title;
      event.description = description;
      event.venue = venue;
      event.eventDate = new Date(eventDate);
      
      // Use admin info from req.userId and departmentId (set by verifyJWTToken middleware)
      const adminId = (req as any).userId;
      const departmentId = (req as any).departmentId;
      event.createdBy = adminId;
      event.departmentId = departmentId; // This is now the department ObjectId as string
      
      // Auto-set status based on event date
      const now = new Date();
      const eventDateObj = new Date(eventDate);
      
      if (eventDateObj < now) {
        event.status = 'completed';
      } else if (eventDateObj.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) { // Within 24 hours
        event.status = 'ongoing';
      } else {
        event.status = 'upcoming';
      }
      
      event.createdAt = new Date();
      event.updatedAt = new Date();

      const savedEvent = await this.eventRepository.save(event);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: savedEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /api/admin/events/:id
  updateEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const event = await this.eventRepository.findOne({
        where: { _id: new ObjectId(id) } as any
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Add updatedAt timestamp
      updateData.updatedAt = new Date();

      // Convert eventDate to Date object if provided
      if (updateData.eventDate) {
        updateData.eventDate = new Date(updateData.eventDate);
      }

      await this.eventRepository.update(event._id, updateData);

      const updatedEvent = await this.eventRepository.findOne({
        where: { _id: new ObjectId(id) } as any
      });

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /api/admin/events/:id
  deleteEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const event = await this.eventRepository.findOne({
        where: { _id: new ObjectId(id) } as any
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await this.eventRepository.delete(event._id);

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/admin/events/stats
  getEventStats = async (req: Request, res: Response) => {
    try {
      await this.updateEventStatuses();

      const [total, upcoming, ongoing, completed, cancelled] = await Promise.all([
        this.eventRepository.count(),
        this.eventRepository.count({ where: { status: 'upcoming' } }),
        this.eventRepository.count({ where: { status: 'ongoing' } }),
        this.eventRepository.count({ where: { status: 'completed' } }),
        this.eventRepository.count({ where: { status: 'cancelled' } })
      ]);

      res.status(200).json({
        success: true,
        data: {
          total,
          upcoming,
          ongoing,
          completed,
          cancelled
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

