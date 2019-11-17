﻿using AutoMapper;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using SignalRChat.Domain.Features.Annotations;
using SignalRChat.Infra.Results;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SignalRChat.Applications.Features.Annotations.Handlers
{
    [AutoMap(typeof(Annotation))]
    public class AnnotationsCreate
    {
        public class Command : IRequest<Result<Annotation, Exception>>
        {
            public string Name { get; set; }
            public string Text { get; set; }

            public virtual ValidationResult Validate()
            {
                return new Validator().Validate(this);
            }

            class Validator : AbstractValidator<Command>
            {
                public Validator()
                {
                    RuleFor(c => c.Name).NotEmpty().MaximumLength(255);
                    RuleFor(c => c.Text).NotEmpty().MaximumLength(255);
                }
            }
        }

        public class Handler : IRequestHandler<Command, Result<Annotation, Exception>>
        {
            private readonly IMapper _mapper;
            private readonly IAnnotationRepository _messageRepository;

            public Handler(IMapper mapper, IAnnotationRepository messageRepository)
            {
                _mapper = mapper;
                _messageRepository = messageRepository;
            }

            public async Task<Result<Annotation, Exception>> Handle(Command request, CancellationToken cancellationToken)
            {
                var annotation = _mapper.Map<Annotation>(request);

                var callback = await _messageRepository.AddAnnotation(annotation);
                if (callback.IsFailure)
                    return callback.Failure;
                return callback.Success;
            }
        }
    }
}