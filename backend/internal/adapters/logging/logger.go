package logging

import "log"

type Logger interface {
	Printf(format string, args ...interface{})
}

type StdLogger struct {
	logger *log.Logger
}

func NewStdLogger(logger *log.Logger) *StdLogger {
	return &StdLogger{logger: logger}
}

func (l *StdLogger) Printf(format string, args ...interface{}) {
	l.logger.Printf(format, args...)
}

type NopLogger struct{}

func (NopLogger) Printf(string, ...interface{}) {}
