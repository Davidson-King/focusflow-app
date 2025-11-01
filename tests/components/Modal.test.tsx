import React, { useState } from 'react';
import { expect } from 'chai';
import { render, screen, userEvent, waitFor } from '../test-utils';
import Modal from '../../components/Modal.tsx';

const ModalTestComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test Modal">
                <p>This is modal content.</p>
            </Modal>
        </div>
    );
};

export default [
    {
        name: 'should not be visible initially',
        fn: async () => {
            render(<ModalTestComponent />);
            expect(screen.queryByRole('dialog')).to.be.null;
        }
    },
    {
        name: 'should open when the trigger button is clicked',
        fn: async () => {
            render(<ModalTestComponent />);
            const openButton = screen.getByText('Open Modal');
            await userEvent.click(openButton);
            const dialog = await screen.findByRole('dialog');
            expect(dialog).to.exist;
            expect(screen.getByText('Test Modal')).to.exist;
            expect(screen.getByText('This is modal content.')).to.exist;
        }
    },
    {
        name: 'should close when the close button is clicked',
        fn: async () => {
            render(<ModalTestComponent />);
            await userEvent.click(screen.getByText('Open Modal'));
            
            const dialog = await screen.findByRole('dialog');
            expect(dialog).to.exist;

            const closeButton = screen.getByLabelText('Close modal');
            await userEvent.click(closeButton);
            
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).to.be.null;
            });
        }
    },
    {
        name: 'should close when the escape key is pressed',
        fn: async () => {
            render(<ModalTestComponent />);
            await userEvent.click(screen.getByText('Open Modal'));
            
            const dialog = await screen.findByRole('dialog');
            expect(dialog).to.exist;

            await userEvent.keyboard('{Escape}');

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).to.be.null;
            });
        }
    },
     {
        name: 'should close when clicking on the overlay',
        fn: async () => {
            render(<ModalTestComponent />);
            await userEvent.click(screen.getByText('Open Modal'));
            
            const dialog = await screen.findByRole('dialog');
            expect(dialog).to.exist;
            
            // The dialog itself is the overlay in this case, as it has the onClick handler
            await userEvent.click(dialog);
            
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).to.be.null;
            });
        }
    },
];