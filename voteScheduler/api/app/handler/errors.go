package handler

import (
	"net/http"

	"github.com/go-chi/render"
)

type ErrResponse struct {
	StatusCode int    `json:"status_code"`
	Error      string `json:"error"`

	StatusText string `json:"status"`         // user-level status message
	AppCode    int64  `json:"code,omitempty"` // application-specific error code
}

func (e *ErrResponse) Render(w http.ResponseWriter, r *http.Request) error {
	render.Status(r, e.StatusCode)
	return nil
}

func ErrInvalidRequest(err error) *ErrResponse {
	return &ErrResponse{
		StatusCode: http.StatusBadRequest,
		Error:      err.Error(),
	}
}

var (
	// ErrBadRequest returns status 400 Bad Request for malformed request body.
	ErrBadRequest = &ErrResponse{StatusCode: http.StatusBadRequest, StatusText: http.StatusText(http.StatusBadRequest)}

	// ErrUnauthorized returns 401 Unauthorized.
	ErrUnauthorized = &ErrResponse{StatusCode: http.StatusUnauthorized, StatusText: http.StatusText(http.StatusUnauthorized)}

	// ErrForbidden returns status 403 Forbidden for unauthorized request.
	ErrForbidden = &ErrResponse{StatusCode: http.StatusForbidden, StatusText: http.StatusText(http.StatusForbidden)}

	// ErrNotFound returns status 404 Not Found for invalid resource request.
	ErrNotFound = &ErrResponse{StatusCode: http.StatusNotFound, StatusText: http.StatusText(http.StatusNotFound)}

	// ErrInternalServerError returns status 500 Internal Server Error.
	ErrInternalServerError = &ErrResponse{StatusCode: http.StatusInternalServerError, StatusText: http.StatusText(http.StatusInternalServerError)}
)
