import PropTypes from 'prop-types';


// MUI components
import {
    Box,
    IconButton,
    TableFooter,
    TablePagination,
    TableRow
  } from '@mui/material';


  import FirstPageIcon from '@mui/icons-material/FirstPage';
  import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
  import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
  import LastPageIcon from '@mui/icons-material/LastPage';
  


//for pagination
 function TablePaginationActions(props) {
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>
    );
  }

  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };


  export default function CustomTablePagination(props) {
    const { page, rowsPerPage, count, colSpan, onPaginationChange, inShort } = props;
    //const [page, setPage] = React.useState(0);
    //const [rowsPerPage, setRowsPerPage] = React.useState(10);

      // Avoid a layout jump when reaching the last page with empty rows.
      const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - count) : 0;
    
      const handleChangePage = (event, newPage) => {
        //setPage(newPage);
        //console.log("Page changed: " + newPage);
        onPaginationChange(newPage, rowsPerPage);
      };
  
      const handleChangeRowsPerPage = (event) => {
        //setRowsPerPage(parseInt(event.target.value, 10));
        //setPage(0);
        onPaginationChange(0, parseInt(event.target.value, 10));
      };

      return (
        <TableFooter>
          <TableRow >
            
            <TablePagination 
                rowsPerPageOptions={inShort==true?[rowsPerPage]:[5, 10, 25, 50, 100]}
                colSpan={colSpan}
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                inputProps: {
                    'aria-label': 'rows per page',
                },
                native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions} 
                sx={{
                  overflow: "hidden",
                  overflowY: "auto", 
                  overflowX: "auto", 
                  "&::-webkit-scrollbar": {
                    height: 3,
                    width: 3,
                    borderRadius: 2
                    },
                    "&::-webkit-scrollbar-track": {
                    backgroundColor: "white"
                    },
                    "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "gray",
                    borderRadius: 2
                    }
                    }}
            />
           
          </TableRow>
        </TableFooter>
      );
  }